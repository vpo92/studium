// @flow
/**
 * API des traitements longs.
 *
 * Toutes les routes sont réservées aux administrateurs. L'API ne fait
 * qu'empiler et exposer l'état des jobs : l'exécution réelle est assurée
 * par le worker (`src/worker.js`).
 */
import express from 'express';
import uuid from 'uuid';

import auth from '../services/authService';
import jobService from '../services/jobService';
import jobs from '../services/jobs';
import logger from '../utils/logger';

const router = express.Router();

// Toutes les routes ci-dessous exigent un administrateur.
auth.isAdmin.forEach((middleware) => router.use(middleware));

/**
 * Liste les types de traitement déclarés dans le registre.
 * Utilisé par l'IHM pour remplir le sélecteur.
 */
router.get('/types', (req, res) => {
  res.send(jobs.list());
});

/**
 * Liste les derniers jobs (du plus récent au plus ancien).
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const list = await jobService.list(limit);
    res.send(list.map((job) => jobService.serialize(job)));
  } catch (error) {
    next(error);
  }
});

/**
 * Crée un job. Réponse 202 immédiate : le traitement sera exécuté par le
 * worker. Si un job du même type est déjà actif, réponse 409 avec le job
 * existant (l'IHM peut s'y rattacher).
 */
router.post('/', async (req, res, next) => {
  const id = uuid.v4();
  const body = req.body || {};
  const type = body.type;
  const params = body.params && typeof body.params === 'object' ? body.params : {};

  if (!type || typeof type !== 'string') {
    return res.status(400).json({ message: 'Le champ "type" est obligatoire.' });
  }

  const handler = jobs.get(type);
  if (!handler) {
    return res.status(400).json({ message: `Type de traitement inconnu : ${type}` });
  }

  try {
    const job = await jobService.create(type, params, req.user, {
      allowConcurrent: !!handler.allowConcurrent,
    });
    logger.info(`${id}: job ${job._id} (${type}) créé par ${req.user.email}`);
    res.status(202).send(jobService.serialize(job));
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        message: error.message,
        job: error.job || null,
      });
    }
    next(error);
  }
});

/**
 * État détaillé d'un job, avec les dernières erreurs unitaires.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await jobService.get(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Traitement introuvable.' });
    }

    const failures = await jobService.listFailures(job._id, 50);
    const serialized = jobService.serialize(job);
    serialized.failures = failures.map((failure) => ({
      reference: failure.reference,
      message: failure.message,
      createdAt: failure.createdAt,
    }));
    res.send(serialized);
  } catch (error) {
    next(error);
  }
});

/**
 * Demande l'annulation. Un job en attente est annulé immédiatement ;
 * un job en cours s'arrête après l'unité de travail courante.
 */
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const job = await jobService.cancel(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Traitement introuvable.' });
    }
    res.send(jobService.serialize(job));
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
});

/**
 * Relance uniquement les références en erreur dans un nouveau job.
 */
router.post('/:id/retry-failed', async (req, res, next) => {
  try {
    const job = await jobService.get(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Traitement introuvable.' });
    }
    if (job.status === 'queued' || job.status === 'running') {
      return res.status(409).json({ message: 'Le traitement est encore en cours.' });
    }

    const handler = jobs.get(job.type);
    if (!handler) {
      return res.status(400).json({ message: `Type de traitement inconnu : ${job.type}` });
    }

    const references = await jobService.listFailedReferences(job._id);
    const unique = references.filter((reference, index) => {
      return reference && references.indexOf(reference) === index;
    });
    if (!unique.length) {
      return res.status(409).json({ message: 'Aucune fiche en erreur à relancer.' });
    }

    const newJob = await jobService.create(
      job.type,
      Object.assign({}, job.params || {}, { references: unique }),
      req.user,
      { allowConcurrent: !!handler.allowConcurrent }
    );
    res.status(202).send(jobService.serialize(newJob));
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.message, job: error.job || null });
    }
    next(error);
  }
});

export default router;
