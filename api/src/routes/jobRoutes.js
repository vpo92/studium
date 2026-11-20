// @flow
/**
 * API des traitements longs.
 *
 * Toutes les routes sont réservées aux administrateurs. L'API ne fait
 * qu'empiler et exposer l'état des jobs : l'exécution réelle est assurée
 * par le worker (`src/worker.js`).
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import uuid from 'uuid';

import auth from '../services/authService';
import jobService from '../services/jobService';
import jobs from '../services/jobs';
import * as backupLib from '../services/jobs/backupLib';
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
 * Liste les archives de sauvegarde disponibles dans BACKUP_DIR (productibles
 * par le job "restore"). Lecture seule du répertoire du serveur.
 */
router.get('/backups', async (req, res, next) => {
  try {
    const dir = backupLib.getBackupDir();
    let files = [];
    try {
      files = fs.readdirSync(dir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        files = []; // répertoire pas encore créé : aucune archive
      } else {
        // Permissions, montage manquant, BACKUP_DIR hors volume… : afficher
        // la vraie erreur plutôt qu'une liste vide trompeuse.
        logger.error(`jobs/backups: lecture de ${dir} impossible: ${error.message}`);
        throw error;
      }
    }
    const archives = files
      .filter((name) => backupLib.ARCHIVE_NAME_RE.test(name))
      .map((name) => {
        let stat = null;
        try {
          stat = fs.statSync(path.join(dir, name));
        } catch (error) {
          return null;
        }
        if (!stat.isFile()) {
          return null;
        }
        return { name: name, size: stat.size, modifiedAt: stat.mtime };
      })
      .filter((archive) => archive !== null)
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    res.send(archives);
  } catch (error) {
    next(error);
  }
});

/**
 * Téléverse une archive de sauvegarde dans BACKUP_DIR (binaire en corps de
 * requête brut, pas de multipart). Le nom d'origine passe par le paramètre
 * « filename » ; il est nettoyé et le fichier est renommé au format
 * `studium-upload-<horodatage>-<nom>.tar` pour être listé et restaurable.
 * L'archive est d'abord écrite dans un « .part » (invisible de la liste),
 * vérifiée (`tar -tf` + contenu mongodump) puis renommée. Taille plafonnée
 * par BACKUP_UPLOAD_MAX_BYTES (2 Go par défaut).
 * Réponse : 201 { name, size } ; 400 archive invalide ; 413 trop volumineux.
 */
router.post('/backups', async (req, res, next) => {
  const dir = backupLib.getBackupDir();
  const maxBytes = backupLib.getUploadMaxBytes();
  let name = null;
  let tmp = null;

  // Content-Type qui ferait consommer le corps par les parsers globaux
  // (json/urlencoded) avant d'arriver ici : l'archive doit partir en flux brut.
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType.indexOf('application/json') !== -1
    || contentType.indexOf('x-www-form-urlencoded') !== -1) {
    return res.status(415).json({
      message: 'Le corps de requête doit contenir l\'archive binaire brute '
        + '(Content-Type : application/x-tar), pas du formulaire.',
    });
  }

  const cleanup = () => {
    if (tmp) {
      fs.unlink(tmp, () => {});
    }
  };
  const fail = (status: number, message: string) => {
    cleanup();
    if (!res.headersSent) {
      // Connexion refermée une fois la réponse partie : détruire la requête
      // avant couperait le socket (socket hang up côté client) alors qu'il
      // reste du corps entrant non lu.
      res.setHeader('Connection', 'close');
      res.on('finish', () => {
        try {
          req.destroy();
        } catch (error) {
          // déjà refermée : sans importance.
        }
      });
      try {
        res.status(status).json({ message: message });
      } catch (error) {
        // Connexion déjà refermée par le navigateur : rien à signaler.
        logger.warn(`jobs/backups: réponse impossible (${status}): ${message}`);
      }
    }
  };

  try {
    backupLib.ensureDir(dir);
  } catch (error) {
    return next(error);
  }

  try {
    const original = req.query.filename || req.get('x-file-name') || '';
    const reserved = backupLib.reserveUploadName(
      dir,
      backupLib.buildUploadArchiveName(original)
    );
    if (!reserved) {
      return fail(409, 'Trop d\'archives portent ce nom à la seconde près : réessayez.');
    }
    name = reserved;
    // Suffixe uuid : deux téléversements simultanés (même seconde, même
    // nom nettoyé) n'écrivent jamais dans le même fichier partiel.
    tmp = path.join(dir, `${name}.${uuid.v4()}.part`);
  } catch (error) {
    if (error.status === 400) {
      return fail(400, error.message);
    }
    return next(error);
  }

  let size = 0;
  let listing = '';
  try {
    // keepSourceOpen : ne pas détruire la requête HTTP avant la réponse.
    size = await backupLib.saveUploadStream(req, tmp, maxBytes, { keepSourceOpen: true });
    if (!size) {
      return fail(400, 'Archive vide : rien n\'a été reçu.');
    }
    try {
      listing = (await backupLib.runCommand('tar', ['-tf', tmp])).stdout;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return fail(500, 'tar indisponible sur le serveur : import impossible.');
      }
      return fail(
        400,
        'Archive illisible : ' + error.message
        + '. Téléversez une archive produite par le job « Sauvegarde de la base ».'
      );
    }
    if (!backupLib.hasMongoDumpLayout(listing)) {
      return fail(
        400,
        'Archive sans collections au format mongodump '
        + '(fichiers <base>/<collection>.bson.gz) : téléversez une archive '
        + 'produite par le job « Sauvegarde de la base ».'
      );
    }
    const target = path.join(dir, name);
    if (fs.existsSync(target)) {
      // Un autre import a créé l'archive entre la réservation du nom et ici.
      return fail(409, `Une archive « ${name} » vient d'apparaître : réessayez.`);
    }
    fs.renameSync(tmp, target);
    logger.info(`jobs/backups: archive ${name} téléversée (${backupLib.formatBytes(size)}) par ${req.user.email}`);
    res.status(201).json({ name: name, size: size });
  } catch (error) {
    if (error.status === 400 || error.status === 413) {
      return fail(error.status, error.message);
    }
    if (error.code === 'EEXIST') {
      // Le fichier temporaire appartenait à quelqu'un d'autre : on n'y
      // touche pas, on demande juste de réessayer.
      if (!res.headersSent) {
        res.status(409).json({ message: 'Emplacement temporaire occupé : réessayez.' });
      }
      return undefined;
    }
    cleanup();
    next(error);
  }
  return undefined;
});

/**
 * Télécharge une archive de sauvegarde présente dans BACKUP_DIR (flux binaire
 * servi en pièce jointe). Le nom est validé (aucun chemin) et l'archive doit
 * exister ; sinon 400/404.
 */
router.get('/backups/:name/download', (req, res, next) => {
  let file = null;
  try {
    file = backupLib.getArchivePath(req.params.name);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
  if (!file) {
    return res.status(404).json({ message: 'Archive introuvable.' });
  }

  let stat = null;
  try {
    stat = fs.statSync(file);
  } catch (error) {
    return res.status(404).json({ message: 'Archive introuvable.' });
  }

  res.setHeader('Content-Type', 'application/x-tar');
  res.setHeader('Content-Length', String(stat.size));
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(file)}"`);
  const stream = fs.createReadStream(file);
  stream.on('error', next);
  stream.pipe(res);
  return undefined;
});

/**
 * Supprime une archive de sauvegarde de BACKUP_DIR. Le nom est validé
 * (aucun chemin) et l'archive doit exister ; sinon 400/404. Refus (409) si
 * un traitement de restauration encore actif (en file ou en cours) utilise
 * cette archive : on ne coupe pas les pieds d'un restore en cours.
 */
router.delete('/backups/:name', async (req, res, next) => {
  let file = null;
  try {
    file = backupLib.getArchivePath(req.params.name);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
  if (!file) {
    return res.status(404).json({ message: 'Archive introuvable.' });
  }

  try {
    const active = await jobService.findActiveByType('restore');
    if (active && active.params && active.params.archive === req.params.name) {
      return res.status(409).json({
        message: 'Une restauration en cours (ou en file) utilise cette archive : '
          + 'suppression impossible tant que le traitement est actif.',
      });
    }
  } catch (error) {
    return next(error);
  }

  try {
    fs.unlinkSync(file);
    logger.info(`jobs/backups: archive ${req.params.name} supprimée par ${req.user.email}`);
    res.send({ deleted: req.params.name });
  } catch (error) {
    next(error);
  }
  return undefined;
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
