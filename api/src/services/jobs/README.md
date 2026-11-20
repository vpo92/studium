# Traitements longs (jobs)

Les traitements longs ne tournent **jamais** dans le processus HTTP de l'API :
l'API empile un job, et un **worker séparé** l'exécute.

```
IHM admin ──POST /admin/jobs──▶ API ──▶ Mongo (jobs)
   │                                      │
   └──GET /admin/jobs/:id (polling)       ▼
                                    worker (src/worker.js)
```

## Cycle de vie

- `queued` : en attente de worker.
- `running` : en cours d'exécution (heartbeat toutes les 5 s).
- `done` : terminé (peut contenir des erreurs unitaires).
- `failed` : erreur fatale du handler.
- `cancelled` : annulé par un administrateur.

La progression (`total`, `processed`, `succeeded`, `failedCount`) et le
curseur (`cursor` / `cursorIndex`) sont persistés en base. Un job interrompu
(redéploiement, arrêt du worker) est automatiquement remis en file et reprend
au dernier point connu.

## Ajouter un traitement

1. Créer `api/src/services/jobs/monTraitementJob.js` :

```js
const monTraitementJob = {
  type: 'mon-traitement',             // identifiant stable (utilisé par l'API)
  label: 'Mon traitement',            // libellé affiché dans l'IHM
  description: 'Ce que fait le traitement.',
  // allowConcurrent: false,           // true pour autoriser 2 jobs du même type
  // unitLabel: 'collection',          // unité affichée dans l'IHM (défaut : « fiche »)
  // finalMessage: (ctx) => '…',       // message de clôture personnalisé (sinon générique)
  run: async (ctx) => {
    // Optionnel : nombre total d'unités pour la barre de progression.
    await ctx.setTotal(42);

    for (let i = 0; i < 42; i++) {
      // Vérifier l'annulation / l'arrêt du worker entre chaque unité.
      if (ctx.shouldStop()) {
        return;
      }

      // ... faire le travail ...

      // Persiste la progression et le curseur.
      await ctx.step({
        reference: String(i),   // identifiant de l'unité (affiché en cas d'erreur)
        success: true,          // false pour enregistrer une erreur unitaire
        error: null,            // message si success === false
        cursor: String(i),      // pour reprendre après interruption
      });
    }
  },
};

module.exports = monTraitementJob;
```

2. L'enregistrer dans `api/src/services/jobs/index.js` :

```js
import monTraitementJob from './monTraitementJob';

const handlers = {
  [reindexJob.type]: reindexJob,
  [monTraitementJob.type]: monTraitementJob,
};
```

C'est tout : le type apparaît automatiquement dans `GET /admin/jobs/types`
et donc dans le sélecteur de l'IHM. Aucune modification du worker ni des
routes n'est nécessaire.

## API du contexte (`ctx`)

| Méthode | Rôle |
|---|---|
| `ctx.job` | Document du job (dont `params`, `cursor`, `cursorIndex`). |
| `ctx.setTotal(n)` | Définit le total pour la barre de progression. |
| `ctx.setMessage(str)` | Message d'état affiché dans l'IHM. |
| `ctx.step({reference, success, error, cursor, cursorIndex})` | Enregistre une unité : compteurs, erreur éventuelle, curseur. |
| `ctx.shouldStop()` | `true` si annulation demandée ou arrêt du worker. |
| `ctx.isCancelled()` | `true` uniquement en cas d'annulation utilisateur. |
| `ctx.counters()` | Compteurs courants (pour un message final personnalisé). |
| `ctx.logger` | Logger Winston. |

Les handlers ne doivent pas écrire directement dans la collection `jobs` :
`ctx.step` garantit la cohérence de la progression et de la reprise.

## Traitements livrés

| Type | Libellé | Ce qu'il fait |
|---|---|---|
| `reindex` | Réindexation des fiches (RAW → JSON) | Re-parse le `raw` de chaque fiche et met à jour son JSON. |
| `backup` | Sauvegarde de la base (dump + archive) | Dump BSON complet par collection puis archive tar (voir ci-dessous). |
| `restore` | Restauration de la base (depuis une archive) | ⚠ Destructif : remplace toutes les données par le contenu d'une archive produite par `backup` (voir ci-dessous). |

### `backup` — sauvegarde de la base

- Le worker parcourt les collections (hors `system.*`, `logs`, `jobs`,
  `job_failures`) et écrit pour chacune un dump **au format mongodump** :
  documents transmis bruts par le serveur (`find({}, {raw:true})`), concaténés
  et gzipés dans `<BACKUP_DIR>/studium-<horodatage>/<db>/<collection>.bson.gz`,
  accompagné du `<collection>.metadata.json.gz` (index).
- Une fois toutes les collections réussies, l'ensemble est empaqueté en
  `<BACKUP_DIR>/studium-<horodatage>.tar` et le répertoire intermédiaire est
  supprimé. En cas d'échec : aucune archive, erreurs unitaires listées dans le
  panneau et « Relancer les erreurs » produit une archive `…-partiel.tar`.
- Reprise : le curseur (dernière collection terminée) est persisté ; un arrêt
  du worker ou une annulation laisse le répertoire de travail en place, le job
  remis en file ne re-dump que ce qui manque.

**Restauration** :

```bash
tar -xf studium-<horodatage>.tar
mongorestore --gzip --dir .            # ou par collection : --nsInclude
```

**Configuration** : `BACKUP_DIR` (env, sinon `backupDir` dans
`api/config/config.json`, sinon `/var/backups/studium`). En production,
le volume docker `backups` est monté sur `/var/backups/studium` dans le
service `studium_worker`. Aucun binaire externe requis sur le worker.

L'IHM admin expose un raccourci « Sauvegarde de la base » sur la page
d'administration ; le suivi reste le panneau commun des traitements longs.
L'ancienne route `POST /admin/backup` (CLI) empile désormais le même job
au lieu de sauvegarder dans le processus HTTP.

### `restore` — restauration depuis une archive

Opération **destructrice** : supprime toutes les données de la base courante
et les remplace par le contenu d'une archive du job `backup`.

- Paramètres requis : `{ archive: "studium-<horodatage>.tar",
  confirm: "RESTAURER" }` ; option `preBackup` (défaut `true`).
- Le nom d'archive est validé (fichier simple de BACKUP_DIR, liste exposée
  par `GET /admin/jobs/backups`) ; une archive d'une autre base source est
  acceptée (le répertoire `<db>` interne importe peu, la restauration vise
  la base de connexion du worker).
- Déroulé par collection : **sauvegarde de sécurité préalable**
  (`studium-pre-restore-<horodatage>.tar`, produite avant toute écriture),
  extraction, puis par collection : drop → réinsertion des documents BSON
  (types conservés à l'octet près) → recréation des index du
  `.metadata.json.gz` (formats mongodump anciens et récents) ; enfin
  suppression des collections vivantes absentes du dump.
- Collections **jamais supprimées** : `jobs`, `job_failures`, `logs`,
  `system.*` (la restauration ne doit pas détruire la file qui la pilote).
- Reprise idempotente : curseur `r:<collection>` ; une annulation ou un
  échec en phase destructive laisse la base dans un état mixte — d'où la
  sauvegarde de sécurité, restaurable à son tour.
- Ne pas lancer `backup` et `restore` simultanément (workers multiples).

L'IHM admin a une carte dédiée « Restauration de la base » (sélection de
l'archive, option de sauvegarde de sécurité, confirmation par saisie du mot
`RESTAURER`).

## Routes API

Toutes réservées aux administrateurs (`auth.isAdmin`) :

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/admin/jobs/types` | Types de traitement disponibles. |
| `GET` | `/admin/jobs/backups` | Archives de sauvegarde disponibles dans `BACKUP_DIR`. |
| `GET` | `/admin/jobs/backups/:name/download` | Télécharge une archive (flux binaire). |
| `POST` | `/admin/jobs/backups` | Téléverse une archive (ticket #6) : binaire en corps de requête brut, nom d'origine en paramètre `filename`. Le fichier est renommé `studium-upload-<horodatage>-<nom>.tar`, vérifié (`tar -tf`, contenu `.bson.gz`) puis écrit dans `BACKUP_DIR`, où il devient téléchargeable et restaurable. Plafond : `BACKUP_UPLOAD_MAX_BYTES` (2 Go par défaut). |
| `GET` | `/admin/jobs?limit=20` | Derniers jobs. |
| `POST` | `/admin/jobs` | Crée un job `{type, params}` → `202` + job. |
| `GET` | `/admin/jobs/:id` | État détaillé + dernières erreurs. |
| `POST` | `/admin/jobs/:id/cancel` | Annulation. |
| `POST` | `/admin/jobs/:id/retry-failed` | Relance uniquement les erreurs. |

## Worker

- Développement : `npm run worker` (ou `npm run worker:watch`).
- Production : `node worker.js` (bundle webpack), service `studium_worker`
  dans `docker-compose.yml`.
- Variables : `WORKER_POLL_INTERVAL_MS` (2000), `WORKER_HEARTBEAT_MS` (5000),
  `WORKER_STALE_MS` (60000).

Un seul job est exécuté à la fois par worker. Pour augmenter le débit, lancer
plusieurs workers : le `claimNext` est atomique, donc deux workers ne prendront
jamais le même job.
