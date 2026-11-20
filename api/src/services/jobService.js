// @flow
/**
 * Persistance et machine à états des traitements longs ("jobs").
 *
 * Un job est un document Mongo de la collection `jobs`. Les erreurs
 * unitaires sont stockées séparément dans `job_failures` afin de ne pas
 * faire grossir le document principal et de pouvoir relancer uniquement
 * les fiches en échec.
 *
 * Ce service est volontairement générique : il ne connaît aucun type de
 * traitement. Les traitements concrets sont déclarés dans
 * `src/services/jobs/index.js`.
 */
import { ObjectID } from 'mongodb';
import db from '../utils/db';
import logger from '../utils/logger';

const JOBS_COLLECTION = 'jobs';
const FAILURES_COLLECTION = 'job_failures';

const ACTIVE_STATUSES = ['queued', 'running'];

function jobs(): any {
  return db.get().collection(JOBS_COLLECTION);
}

function failures(): any {
  return db.get().collection(FAILURES_COLLECTION);
}

function now(): Date {
  return new Date();
}

function toId(id: any): ObjectID {
  return id instanceof ObjectID ? id : new ObjectID(String(id));
}

function messageOf(error: any): string {
  if (!error) {
    return 'Erreur inconnue';
  }
  return error.message ? error.message : String(error);
}

/**
 * Le driver MongoDB 2.x renvoie { value, lastErrorObject, ok } pour
 * findAndModify ; les versions récentes renvoient directement le document.
 * Ce helper rend le code indépendant de la version du driver.
 */
function unwrap(result: any): any {
  if (result && Object.prototype.hasOwnProperty.call(result, 'value')) {
    return result.value;
  }
  return result;
}

async function ensureIndexes(): Promise<void> {
  await jobs().createIndex({ status: 1, createdAt: 1 });
  await jobs().createIndex({ type: 1, status: 1 });
  await failures().createIndex({ jobId: 1, createdAt: 1 });
}

async function findActiveByType(type: string): Promise<any> {
  return jobs().findOne({ type: type, status: { $in: ACTIVE_STATUSES } });
}

/**
 * Crée un job en file d'attente.
 * @param options.allowConcurrent autorise plusieurs jobs actifs du même type.
 */
async function create(type: string, params: any, user: any, options: any): Promise<any> {
  const opts = options || {};
  if (!opts.allowConcurrent) {
    const active = await findActiveByType(type);
    if (active) {
      const error: any = new Error(`Un traitement de type "${type}" est déjà en cours.`);
      error.status = 409;
      error.job = serialize(active);
      throw error;
    }
  }

  const doc = {
    type: type,
    params: params || {},
    status: 'queued',
    total: 0,
    processed: 0,
    succeeded: 0,
    failedCount: 0,
    cursor: null,
    cursorIndex: null,
    message: 'En attente',
    cancelRequested: false,
    createdBy: user && user.email ? user.email : null,
    createdAt: now(),
    updatedAt: now(),
    startedAt: null,
    finishedAt: null,
    heartbeatAt: null,
  };

  const result = await jobs().insertOne(doc);
  doc._id = result.insertedId;
  logger.info(`jobService.create ${doc._id} (${type})`);
  return doc;
}

async function get(id: string): Promise<any> {
  if (!id || !ObjectID.isValid(String(id))) {
    return null;
  }
  return jobs().findOne({ _id: toId(id) });
}

async function list(limit: number): Promise<Array<any>> {
  return jobs()
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit || 20)
    .toArray();
}

/**
 * Réclame atomiquement le plus ancien job en attente.
 * Renvoie null si la file est vide.
 */
async function claimNext(): Promise<any> {
  const result = await jobs().findOneAndUpdate(
    { status: 'queued' },
    {
      $set: {
        status: 'running',
        startedAt: now(),
        heartbeatAt: now(),
        updatedAt: now(),
        message: 'Démarrage…',
      },
    },
    { sort: { createdAt: 1 }, returnOriginal: false }
  );
  return unwrap(result);
}

/**
 * Remet en file les jobs dont le worker a disparu (heartbeat trop ancien).
 */
async function requeueStale(staleMs: number): Promise<number> {
  const threshold = new Date(Date.now() - staleMs);
  const result = await jobs().updateMany(
    {
      status: 'running',
      $or: [
        { heartbeatAt: null },
        { heartbeatAt: { $lt: threshold } },
      ],
    },
    {
      $set: {
        status: 'queued',
        startedAt: null,
        heartbeatAt: null,
        updatedAt: now(),
        message: 'Reprise après interruption du worker',
      },
    }
  );
  return result.modifiedCount || 0;
}

/**
 * Met à jour le heartbeat et renvoie l'état frais du job.
 * Renvoie null si le job n'est plus "running" (annulé ou récupéré ailleurs).
 */
async function heartbeat(id: any): Promise<any> {
  const result = await jobs().findOneAndUpdate(
    { _id: toId(id), status: 'running' },
    { $set: { heartbeatAt: now() } },
    { returnOriginal: false }
  );
  return unwrap(result);
}

async function setTotal(id: any, total: number): Promise<any> {
  return jobs().updateOne(
    { _id: toId(id) },
    { $set: { total: total, updatedAt: now(), heartbeatAt: now() } }
  );
}

async function setMessage(id: any, message: string): Promise<any> {
  return jobs().updateOne(
    { _id: toId(id) },
    { $set: { message: message, updatedAt: now(), heartbeatAt: now() } }
  );
}

async function updateProgress(id: any, progress: any): Promise<any> {
  const set: any = { updatedAt: now(), heartbeatAt: now() };
  ['processed', 'succeeded', 'failedCount', 'cursor', 'cursorIndex', 'message'].forEach((key) => {
    if (progress[key] !== undefined) {
      set[key] = progress[key];
    }
  });
  return jobs().updateOne({ _id: toId(id) }, { $set: set });
}

async function addFailure(id: any, reference: string, error: any): Promise<any> {
  return failures().insertOne({
    jobId: String(id),
    reference: reference,
    message: messageOf(error).slice(0, 2000),
    createdAt: now(),
  });
}

async function listFailures(id: any, limit: number): Promise<Array<any>> {
  return failures()
    .find({ jobId: String(id) })
    .sort({ createdAt: 1 })
    .limit(limit || 100)
    .toArray();
}

async function listFailedReferences(id: any): Promise<Array<string>> {
  return failures()
    .find({ jobId: String(id) })
    .map((failure) => failure.reference)
    .toArray();
}

async function finish(id: any, status: string, message: string): Promise<any> {
  const result = await jobs().findOneAndUpdate(
    { _id: toId(id) },
    {
      $set: {
        status: status,
        message: message,
        finishedAt: now(),
        updatedAt: now(),
        heartbeatAt: now(),
      },
    },
    { returnOriginal: false }
  );
  return unwrap(result);
}

/**
 * Remet un job interrompu (arrêt du worker) dans la file, en conservant
 * sa progression et son curseur pour reprendre au bon endroit.
 */
async function requeue(id: any, message: string): Promise<any> {
  const result = await jobs().findOneAndUpdate(
    { _id: toId(id) },
    {
      $set: {
        status: 'queued',
        message: message,
        startedAt: null,
        finishedAt: null,
        heartbeatAt: null,
        cancelRequested: false,
        updatedAt: now(),
      },
    },
    { returnOriginal: false }
  );
  return unwrap(result);
}

/**
 * Annule un job. Un job en attente passe immédiatement en "cancelled" ;
 * un job en cours reçoit un drapeau que le worker vérifie entre deux fiches.
 */
async function cancel(id: string): Promise<any> {
  const job = await get(id);
  if (!job) {
    return null;
  }
  if (job.status === 'queued') {
    return finish(job._id, 'cancelled', 'Annulé avant démarrage');
  }
  if (job.status === 'running') {
    const result = await jobs().findOneAndUpdate(
      { _id: job._id },
      { $set: { cancelRequested: true, updatedAt: now(), message: 'Annulation demandée…' } },
      { returnOriginal: false }
    );
    return unwrap(result);
  }
  const error: any = new Error(`Le traitement est déjà terminé (${job.status}).`);
  error.status = 409;
  throw error;
}

/**
 * Représentation JSON stable pour l'API et l'IHM.
 */
function serialize(job: any): any {
  if (!job) {
    return null;
  }
  const total = job.total || 0;
  const processed = job.processed || 0;
  let percent = 0;
  if (job.status === 'done') {
    percent = 100;
  } else if (total > 0) {
    percent = Math.min(99, Math.round((processed / total) * 100));
  }

  const params = Object.assign({}, job.params || {});
  if (Array.isArray(params.references)) {
    params.referenceCount = params.references.length;
    delete params.references;
  }

  const startedAt = job.startedAt ? new Date(job.startedAt).getTime() : null;
  const finishedAt = job.finishedAt ? new Date(job.finishedAt).getTime() : null;
  const durationMs = startedAt ? (finishedAt || Date.now()) - startedAt : null;

  return {
    id: String(job._id),
    type: job.type,
    params: params,
    status: job.status,
    total: total,
    processed: processed,
    succeeded: job.succeeded || 0,
    failedCount: job.failedCount || 0,
    percent: percent,
    message: job.message || '',
    cancelRequested: !!job.cancelRequested,
    createdBy: job.createdBy || null,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    durationMs: durationMs,
    isActive: ACTIVE_STATUSES.indexOf(job.status) !== -1,
  };
}

module.exports = {
  ACTIVE_STATUSES,
  ensureIndexes,
  create,
  findActiveByType,
  get,
  list,
  claimNext,
  requeueStale,
  heartbeat,
  setTotal,
  setMessage,
  updateProgress,
  addFailure,
  listFailures,
  listFailedReferences,
  finish,
  requeue,
  cancel,
  serialize,
};
