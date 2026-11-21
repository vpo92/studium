// Spec unitaire de backupLib : résolution sûre du chemin d'une archive de
// sauvegarde (GET /admin/jobs/backups/:name/download). Aucune commande
// externe ni base simulée ici : uniquement le système de fichiers.
import fs from 'fs';
import os from 'os';
import path from 'path';

jest.mock('../../src/utils/db', () => ({
  get: jest.fn(),
}));

process.env.MONGODB_CONNECTION_STRING = 'mongodb://fake-host:27099/studium-test';

const backupLib = require('../../src/services/jobs/backupLib');

const VALID_ARCHIVE = 'studium-20261120-120000-test.tar';

let backupDir = '';

beforeEach(() => {
  backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-backups-'));
  process.env.BACKUP_DIR = backupDir;
});

afterEach(() => {
  backupLib.removeDir(backupDir);
  delete process.env.BACKUP_DIR;
});

describe('getBackupDir', () => {
  it('résout BACKUP_DIR depuis l’environnement', () => {
    expect(backupLib.getBackupDir()).toBe(backupDir);
  });
});

describe('getArchivePath', () => {
  it('retourne le chemin absolu d’une archive existante', () => {
    const file = path.join(backupDir, VALID_ARCHIVE);
    fs.writeFileSync(file, 'tar');

    expect(backupLib.getArchivePath(VALID_ARCHIVE)).toBe(file);
  });

  it('retourne null si l’archive n’existe pas', () => {
    expect(backupLib.getArchivePath(VALID_ARCHIVE)).toBeNull();
  });

  it('retourne null si le nom désigne un répertoire', () => {
    fs.mkdirSync(path.join(backupDir, VALID_ARCHIVE));

    expect(backupLib.getArchivePath(VALID_ARCHIVE)).toBeNull();
  });

  it('rejette les noms invalides avec une erreur 400', () => {
    const invalid = [
      '',
      null,
      undefined,
      'studium-x.tar', // horodatage trop court (< 8 caractères)
      'not-an-archive.txt',
      '../etc/passwd',
      'a/studium-20261120-120000.tar',
      'studium-20261120-120000.tar/../../evil',
    ];
    invalid.forEach((name) => {
      let error = null;
      try {
        backupLib.getArchivePath(name);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(error.status).toBe(400);
    });
  });

  it('ne sort jamais de BACKUP_DIR (pas de traversée de chemin)', () => {
    // Le fichier cible existe mais son nom contient un chemin : rejeté 400.
    fs.writeFileSync(path.join(backupDir, VALID_ARCHIVE), 'tar');
    const traversal = `sub/../${VALID_ARCHIVE}`;

    expect(() => backupLib.getArchivePath(traversal)).toThrow(/invalide/);
  });
});

/* --------------------------------------------------------------------- *
 *  Téléversement d'archives (POST /admin/jobs/backups)
 * --------------------------------------------------------------------- */

describe('buildUploadArchiveName', () => {
  // 2026-11-20 12:00:00, local.
  const date = new Date(2026, 10, 20, 12, 0, 0);

  it('nettoie un nom courant et garde un nom reconnaissable', () => {
    const name = backupLib.buildUploadArchiveName('ma sauvegarde du 29 oct.tar', date);

    expect(name).toBe('studium-upload-20261120-120000-ma-sauvegarde-du-29-oct.tar');
    expect(backupLib.ARCHIVE_NAME_RE.test(name)).toBe(true);
  });

  it('retire les extensions d\'archive (.tar.gz, .tgz, .gz)', () => {
    const name = backupLib.buildUploadArchiveName('backup_studium_20261029.tar.gz', date);

    expect(name).toBe('studium-upload-20261120-120000-backup_studium_20261029.tar');
  });

  it('ignore tout chemin contenu dans le nom fourni (traversée)', () => {
    const name = backupLib.buildUploadArchiveName('../../etc/passwd', date);

    expect(name).toBe('studium-upload-20261120-120000-passwd.tar');
    expect(name.indexOf('/')).toBe(-1);
  });

  it('tronque les noms démesurés dans les bornes de l\'archive', () => {
    const name = backupLib.buildUploadArchiveName(`${'a'.repeat(300)}.tar`, date);

    expect(backupLib.ARCHIVE_NAME_RE.test(name)).toBe(true);
    expect(name.length).toBeLessThanOrEqual('studium-'.length + 120 + '.tar'.length);
  });

  it('reste valide sans aucun nom d\'origine', () => {
    const name = backupLib.buildUploadArchiveName(undefined, date);

    expect(name).toBe('studium-upload-20261120-120000.tar');
    expect(backupLib.ARCHIVE_NAME_RE.test(name)).toBe(true);
  });
});

describe('reserveUploadName', () => {
  it('retourne le nom tel quel quand il est libre', () => {
    expect(backupLib.reserveUploadName(backupDir, VALID_ARCHIVE)).toBe(VALID_ARCHIVE);
  });

  it('ajoute un suffixe numéroté tant que le nom est pris', () => {
    fs.writeFileSync(path.join(backupDir, VALID_ARCHIVE), 'tar');
    fs.writeFileSync(path.join(backupDir, `${VALID_ARCHIVE.replace(/\.tar$/, '')}-2.tar`), 'tar');

    const reserved = backupLib.reserveUploadName(backupDir, VALID_ARCHIVE);

    expect(reserved).toBe(`${VALID_ARCHIVE.replace(/\.tar$/, '')}-3.tar`);
    expect(backupLib.ARCHIVE_NAME_RE.test(reserved)).toBe(true);
  });
});

describe('hasMongoDumpLayout', () => {
  it('accepte une liste tar contenant des collections bson.gz', () => {
    const listing = './\n./studium/\n./studium/fiches.bson.gz\n./studium/fiches.metadata.json.gz\n';

    expect(backupLib.hasMongoDumpLayout(listing)).toBe(true);
  });

  it('refuse un tar sans contenu mongodump (bson non compressé seul)', () => {
    expect(backupLib.hasMongoDumpLayout('./studium/fiches.bson\n')).toBe(false);
  });

  it('refuse une liste vide ou non textuelle', () => {
    expect(backupLib.hasMongoDumpLayout('')).toBe(false);
    expect(backupLib.hasMongoDumpLayout(null)).toBe(false);
  });
});

describe('saveUploadStream', () => {
  it('écrit tout le flux et renvoie la taille reçue', async () => {
    const source = path.join(backupDir, 'source.bin');
    fs.writeFileSync(source, 'x'.repeat(4096));
    const tmp = path.join(backupDir, 'target.part');

    const size = await backupLib.saveUploadStream(fs.createReadStream(source), tmp, 1024 * 1024);

    expect(size).toBe(4096);
    expect(fs.readFileSync(tmp).length).toBe(4096);
  });

  it('rejette avec 413 et nettoie le fichier partiel si la limite est dépassée', async () => {
    const source = path.join(backupDir, 'gros.bin');
    fs.writeFileSync(source, 'x'.repeat(64));
    const tmp = path.join(backupDir, 'gros.part');

    let error = null;
    try {
      await backupLib.saveUploadStream(fs.createReadStream(source), tmp, 16);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error.status).toBe(413);
    expect(fs.existsSync(tmp)).toBe(false);
  });

  it('n\'écrase pas un fichier existant et le laisse intact (drapeau wx)', async () => {
    const tmp = path.join(backupDir, 'occupé.part');
    fs.writeFileSync(tmp, 'précieux');
    const source = path.join(backupDir, 'autre.bin');
    fs.writeFileSync(source, 'x'.repeat(32));

    let error = null;
    try {
      await backupLib.saveUploadStream(fs.createReadStream(source), tmp, 1024);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(fs.readFileSync(tmp).toString()).toBe('précieux');
  });
});

describe('backupLib — types de sauvegarde (ticket #10)', () => {
  it('valide le mode et prend « contenu » par défaut', () => {
    expect(backupLib.validateBackupMode(undefined)).toBe('contenu');
    expect(backupLib.validateBackupMode('')).toBe('contenu');
    expect(backupLib.validateBackupMode('contenu')).toBe('contenu');
    expect(backupLib.validateBackupMode('full')).toBe('full');
    expect(() => backupLib.validateBackupMode('tout')).toThrow(/invalide/);
    try {
      backupLib.validateBackupMode('tout');
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  it('nomme les archives avec leur type (et « partiel » en relance)', () => {
    expect(backupLib.archiveNameOf('20261121-101112', 'contenu', false))
      .toBe('studium-20261121-101112-contenu.tar');
    expect(backupLib.archiveNameOf('20261121-101112', 'full', false))
      .toBe('studium-20261121-101112-full.tar');
    expect(backupLib.archiveNameOf('20261121-101112', 'full', true))
      .toBe('studium-20261121-101112-full-partiel.tar');
    expect(backupLib.ARCHIVE_NAME_RE.test(backupLib.archiveNameOf('20261121-101112', 'contenu', true)))
      .toBe(true);
  });

  it('reconnaît le type depuis le nom, null sinon (archive legacy)', () => {
    expect(backupLib.modeFromArchiveName('studium-20261121-101112-contenu.tar')).toBe('contenu');
    expect(backupLib.modeFromArchiveName('studium-20261121-101112-full.tar')).toBe('full');
    expect(backupLib.modeFromArchiveName('studium-20261121-101112-full-partiel.tar')).toBe('full');
    expect(backupLib.modeFromArchiveName('studium-20261121-101112.tar')).toBeNull();
    expect(backupLib.modeFromArchiveName('studium-upload-mon-dump.tar')).toBeNull();
  });

  it('round-trip du manifeste d\'archive (writeBackupInfo / readBackupInfo)', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-manifest-'));
    await backupLib.writeBackupInfo(dir, { mode: 'contenu', dbName: 'studium' });
    expect(backupLib.readBackupInfo(dir)).toMatchObject({ mode: 'contenu', dbName: 'studium' });
  });

  it('readBackupInfo tolère l\'absence ou un contenu invalide (legacy)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-manifest-'));
    expect(backupLib.readBackupInfo(dir)).toBeNull();
    fs.writeFileSync(path.join(dir, backupLib.BACKUP_INFO_FILE), 'pas du gzip');
    expect(backupLib.readBackupInfo(dir)).toBeNull();
  });

  it('le mode « contenu » exclut bien comptes, jobs et logs', () => {
    expect(backupLib.CONTENT_EXCLUDED_COLLECTIONS).toEqual(
      ['logs', 'jobs', 'job_failures', 'users']);
    expect(backupLib.CONTENT_EXCLUDED_COLLECTIONS.indexOf('prosopography')).toBe(-1);
  });
});
