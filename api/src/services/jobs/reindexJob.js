// @flow
/**
 * Traitement de réindexation des fiches : re-parse le `raw` et met à jour
 * le JSON en base.
 *
 * Pour ajouter un nouveau traitement, copier ce fichier, changer `type`,
 * `label`, `description`, puis l'enregistrer dans `./index.js`. Le worker,
 * l'API et l'IHM le découvrent automatiquement.
 */
import service from '../prosopographyService';

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 3;

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
 * Réindexe une fiche, avec quelques tentatives en cas d'erreur transitoire.
 * L'avancement (curseur) est persisté par `ctx.step`, y compris en cas
 * d'échec définitif, pour ne pas bloquer la reprise sur une fiche cassée.
 */
async function processOne(ctx: any, reference: string, cursorUpdate: any): Promise<void> {
  let outcome = null;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await service.reindexFromRaw(reference);
      outcome = result.status === 'not_found'
        ? { success: false, error: 'Fiche introuvable' }
        : { success: true };
      break;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * attempt);
      }
    }
  }

  if (!outcome) {
    outcome = { success: false, error: messageOf(lastError) };
  }

  await ctx.step(Object.assign({ reference: reference }, outcome, cursorUpdate));
}

/**
 * Réindexation complète : parcourt les références par pages triées et
 * reprend après le dernier curseur connu.
 */
async function runAll(ctx: any): Promise<void> {
  const total = await service.countAll();
  await ctx.setTotal(total);

  let after = ctx.job.cursor || null;
  while (!ctx.shouldStop()) {
    const references = await service.getReferencesPage(after, BATCH_SIZE);
    if (!references.length) {
      break;
    }

    for (let i = 0; i < references.length; i++) {
      if (ctx.shouldStop()) {
        return;
      }
      const reference = references[i];
      await processOne(ctx, reference, { cursor: reference });
      after = reference;
    }
  }
}

/**
 * Réindexation d'une liste explicite de références (relance des erreurs).
 */
async function runReferences(ctx: any, references: Array<string>): Promise<void> {
  await ctx.setTotal(references.length);
  const start = typeof ctx.job.cursorIndex === 'number' ? ctx.job.cursorIndex : 0;

  for (let i = start; i < references.length; i++) {
    if (ctx.shouldStop()) {
      return;
    }
    await processOne(ctx, references[i], { cursorIndex: i + 1 });
  }
}

const reindexJob = {
  type: 'reindex',
  label: 'Réindexation des fiches (RAW → JSON)',
  description:
    'Re-parse le champ raw de chaque fiche et met à jour son JSON. ' +
    'Traitement long, exécuté en arrière-plan par le worker.',
  run: async (ctx: any): Promise<void> => {
    const params = ctx.job.params || {};
    if (Array.isArray(params.references) && params.references.length > 0) {
      await runReferences(ctx, params.references);
    } else {
      await runAll(ctx);
    }
  },
};

module.exports = reindexJob;
