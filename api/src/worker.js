// @flow
/**
 * Worker des traitements longs.
 *
 * Processus séparé de l'API : il réclame les jobs en attente dans Mongo,
 * exécute le handler correspondant et persiste la progression. Il peut
 * être arrêté/redémarré sans perdre le job : la progression et le curseur
 * sont en base, et un job interrompu est remis en file.
 *
 * Lancement :
 *   npm run worker
 *   node worker.js            (image de production)
 */
import config from '../config';
import db from './utils/db';
import logger from './utils/logger';
import jobService from './services/jobService';
import jobs from './services/jobs';

const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '2000', 10);
const HEARTBEAT_MS = parseInt(process.env.WORKER_HEARTBEAT_MS || '5000', 10);
const STALE_MS = parseInt(process.env.WORKER_STALE_MS || '60000', 10);

let stopping = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageOf(error: any): string {
  if (!error) {
    return 'Erreur inconnue';
  }
  return error.message ? error.message : String(error);
}

/**
 * Contexte mis à disposition des handlers de traitement.
 * Les handlers ne parlent jamais directement à Mongo : ils utilisent
 * `ctx.step`, `ctx.setTotal`, etc., ce qui garde la progression cohérente.
 */
function createContext(job: any, state: any): any {
  const counters = {
    processed: job.processed || 0,
    succeeded: job.succeeded || 0,
    failedCount: job.failedCount || 0,
  };
  let cursor = job.cursor || null;
  let cursorIndex = typeof job.cursorIndex === 'number' ? job.cursorIndex : null;

  return {
    job: job,
    logger: logger,

    /** Vrai si l'utilisateur a annulé ou si le worker doit s'arrêter. */
    shouldStop: (): boolean => {
      return stopping || state.cancelRequested;
    },

    isCancelled: (): boolean => {
      return state.cancelRequested;
    },

    counters: (): any => {
      return {
        processed: counters.processed,
        succeeded: counters.succeeded,
        failedCount: counters.failedCount,
        cursor: cursor,
        cursorIndex: cursorIndex,
      };
    },

    setTotal: async (total: number): Promise<void> => {
      await jobService.setTotal(job._id, total);
    },

    setMessage: async (message: string): Promise<void> => {
      await jobService.setMessage(job._id, message);
    },

    /**
     * Enregistre l'avancement d'une unité de travail.
     * Persiste aussi le curseur pour permettre la reprise.
     */
    step: async (step: any): Promise<void> => {
      const success = step.success !== false;
      counters.processed += 1;
      if (success) {
        counters.succeeded += 1;
      } else {
        counters.failedCount += 1;
        await jobService.addFailure(job._id, step.reference, step.error);
      }

      if (step.cursor !== undefined && step.cursor !== null) {
        cursor = step.cursor;
      }
      if (step.cursorIndex !== undefined && step.cursorIndex !== null) {
        cursorIndex = step.cursorIndex;
      }

      await jobService.updateProgress(job._id, {
        processed: counters.processed,
        succeeded: counters.succeeded,
        failedCount: counters.failedCount,
        cursor: cursor,
        cursorIndex: cursorIndex,
      });
    },
  };
}

/**
 * Exécute un job jusqu'au bout, puis le clôture selon trois cas :
 * annulation utilisateur, arrêt du worker (remise en file), ou fin normale.
 */
async function runJob(job: any, handler: any): Promise<void> {
  const state = {
    cancelRequested: !!job.cancelRequested,
    timer: null,
  };
  const ctx = createContext(job, state);

  // Le heartbeat sert aussi à récupérer le drapeau d'annulation.
  state.timer = setInterval(async () => {
    try {
      const fresh = await jobService.heartbeat(job._id);
      if (!fresh) {
        state.cancelRequested = true;
      } else {
        state.cancelRequested = !!fresh.cancelRequested;
      }
    } catch (error) {
      logger.error(`worker: heartbeat job ${job._id} failed: ${messageOf(error)}`);
    }
  }, HEARTBEAT_MS);

  try {
    await jobService.setMessage(job._id, `En cours — ${handler.label}`);
    await handler.run(ctx);

    // Relit l'état pour ne pas rater une annulation arrivée à la dernière seconde.
    const fresh = await jobService.get(job._id);
    const cancelled = state.cancelRequested ||
      (fresh && (fresh.cancelRequested || fresh.status === 'cancelled'));

    if (cancelled) {
      await jobService.finish(job._id, 'cancelled', 'Traitement annulé');
    } else if (stopping) {
      await jobService.requeue(job._id, 'Interrompu par l\'arrêt du worker, reprise automatique');
    } else {
      const counts = ctx.counters();
      let message = counts.processed === 0
        ? 'Terminé : aucune fiche à traiter'
        : `Terminé : ${counts.succeeded} fiche(s) traitée(s)`;
      if (counts.failedCount > 0) {
        message += `, ${counts.failedCount} erreur(s)`;
      }
      await jobService.finish(job._id, 'done', message);
    }
  } catch (error) {
    logger.error(`worker: job ${job._id} failed: ${error && error.stack ? error.stack : messageOf(error)}`);

    if (state.cancelRequested) {
      await jobService.finish(job._id, 'cancelled', 'Traitement annulé');
    } else if (stopping) {
      await jobService.requeue(job._id, 'Interrompu par l\'arrêt du worker, reprise automatique');
    } else {
      await jobService.finish(job._id, 'failed', messageOf(error));
    }
  } finally {
    clearInterval(state.timer);
  }
}

async function loop(): Promise<void> {
  while (!stopping) {
    let job = null;
    try {
      job = await jobService.claimNext();
    } catch (error) {
      logger.error(`worker: claimNext failed: ${messageOf(error)}`);
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (!job) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const handler = jobs.get(job.type);
    if (!handler) {
      logger.error(`worker: unknown job type "${job.type}"`);
      await jobService.finish(job._id, 'failed', `Type de traitement inconnu : ${job.type}`);
      continue;
    }

    logger.info(`worker: job ${job._id} (${job.type}) started`);
    await runJob(job, handler);
    logger.info(`worker: job ${job._id} (${job.type}) settled`);
  }
}

async function main(): Promise<void> {
  const mongoUrl = process.env.MONGODB_CONNECTION_STRING || config.mongooseDB;
  if (!mongoUrl) {
    throw new Error('MONGODB_CONNECTION_STRING manquant pour le worker');
  }

  logger.info(`studium worker starting, mongo: ${mongoUrl}`);
  await db.connectAsync(mongoUrl);
  await jobService.ensureIndexes();

  const requeued = await jobService.requeueStale(STALE_MS);
  if (requeued > 0) {
    logger.warn(`worker: ${requeued} job(s) remis en file (heartbeat expiré)`);
  }

  process.on('SIGTERM', () => {
    logger.info('worker: SIGTERM reçu, arrêt après l\'unité de travail en cours');
    stopping = true;
  });
  process.on('SIGINT', () => {
    logger.info('worker: SIGINT reçu, arrêt après l\'unité de travail en cours');
    stopping = true;
  });

  await loop();

  await new Promise((resolve) => db.close(resolve));
  logger.info('worker: arrêté');
  process.exit(0);
}

main().catch((error) => {
  logger.error(`worker: fatal error: ${error && error.stack ? error.stack : messageOf(error)}`);
  process.exit(1);
});
