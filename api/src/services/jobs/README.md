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
| `backup` | Sauvegarde de la base (dump + archive) | Dump BSON par collection (type contenu ou full) puis archive tar (voir ci-dessous). |
| `restore` | Restauration de la base (depuis une archive) | ⚠ Destructif : remplace la base selon le type de l'archive — contenu : comptes/jobs/logs préservés ; full : remplacement intégral (voir ci-dessous). |

### `backup` — sauvegarde de la base

- Deux **types** de sauvegarde (ticket #10), choisis par `params.mode` :
  - **`contenu`** (défaut) : données métier uniquement. Collections exclues :
    `system.*`, `logs`, `jobs`, `job_failures` **et `users`** (comptes).
    C'est le type à utiliser pour transférer du contenu entre environnements
    (production → recette) sans écraser les comptes, la file de jobs ni les
    logs de la cible.
  - **`full`** : intégralité de la base (users, jobs et logs inclus) —
    sauvegarde technique complète.
- Le worker parcourt les collections retenues et écrit pour chacune un dump
  **au format mongodump** : documents transmis bruts par le serveur
  (`find({}, {raw:true})`), concaténés et gzipés dans
  `<BACKUP_DIR>/studium-<horodatage>/<db>/<collection>.bson.gz`, accompagné du
  `<collection>.metadata.json.gz` (index).
- Un manifeste `studium-backup-info.json.gz` (type, base source, date) est
  ajouté à la racine du répertoire de dump avant empaquetage : le job restore
  s'y fie même si l'archive est renommée ou téléversée.
- Une fois toutes les collections réussies, l'ensemble est empaqueté en
  `<BACKUP_DIR>/studium-<horodatage>-<contenu|full>.tar` (suffixe `-partiel`
  ajouté par « Relancer les erreurs ») et le répertoire intermédiaire est
  supprimé. En cas d'échec : aucune archive, erreurs unitaires listées dans le
  panneau et « Relancer les erreurs » produit une archive `…-partiel.tar`.
- Reprise : le curseur (dernière collection terminée) est persisté ; un arrêt
  du worker ou une annulation laisse le répertoire de travail en place, le job
  remis en file ne re-dump que ce qui manque.

**Restauration** :

```bash
tar -xf studium-<horodatage>-<type>.tar
mongorestore --gzip --dir .            # ou par collection : --nsInclude
```

**Configuration** : `BACKUP_DIR` (env, sinon `backupDir` dans
`api/config/config.json`, sinon `/var/backups/studium`). En production,
le volume docker `backups` est monté sur `/var/backups/studium` dans le
service `studium_worker`. Aucun binaire externe requis sur le worker.

L'IHM admin expose un raccourci « Sauvegarde de la base » sur la page
d'administration avec le choix du type (**Contenu sélectionné par défaut**) ;
le suivi reste le panneau commun des traitements longs. L'ancienne route
`POST /admin/backup` (CLI) empile désormais le même job au lieu de
sauvegarder dans le processus HTTP ; son corps accepte `{"mode": "contenu|full"}`.

### `restore` — restauration depuis une archive

Opération **destructive pour les collections restaurées**, au périmètre
déterminé par le **type de l'archive** (ticket #10) :

- **contenu** : seule la donnée métier est remplacée ; `users`, `jobs`,
  `job_failures` et `logs` ne sont **ni écrasés ni supprimés** — restaurer un
  dump de production en recette ne casse plus les sessions ni les comptes de
  la cible (c'était la cause de l'erreur 500 : la table `users` était
  écrasée, le compte de l'administrateur connecté disparaissait, et
  `authService` plantait sur ce compte absent) ;
- **full** : toutes les collections du dump remplacent leur équivalent
  courant (comptes inclus — un compte administrateur doit exister dans
  l'archive) et les collections vivantes absentes du dump sont supprimées,
  sauf `jobs`, `job_failures`, `logs` ;
- archives anciennes sans manifeste ni suffixe : traitées en **full** si le
  dump contient `users`, sinon en **contenu** ; `GET /admin/jobs/backups`
  les affiche en mode « legacy ».

- Paramètres requis : `{ archive: "studium-<horodatage>-<type>.tar",
  confirm: "RESTAURER" }` ; options `preBackup` (défaut `true`) et `mode`
  (forcer le type ; sinon : manifeste → suffixe du nom → présence de `users`).
- Le nom d'archive est validé (fichier simple de BACKUP_DIR, liste exposée
  par `GET /admin/jobs/backups`) ; une archive d'une autre base source est
  acceptée (le répertoire `<db>` interne importe peu, la restauration vise
  la base de connexion du worker).
- Déroulé par collection : **sauvegarde de sécurité préalable**
  (`studium-pre-restore-<horodatage>.tar`, produite avant toute écriture),
  extraction, puis par collection : drop → réinsertion des documents BSON
  (types conservés à l'octet près) → recréation des index du
  `.metadata.json.gz` (formats mongodump anciens et récents) ; enfin
  suppression des collections vivantes absentes du dump (mode full uniquement).
- Collections **jamais supprimées** : `jobs`, `job_failures`, `logs`,
  `system.*` (la restauration ne doit pas détruire la file qui la pilote) ;
  en mode contenu, `users` s'y ajoute.
- Reprise idempotente : curseur `r:<collection>` ; une annulation ou un
  échec en phase destructive laisse la base dans un état mixte — d'où la
  sauvegarde de sécurité, restaurable à son tour.
- Ne pas lancer `backup` et `restore` simultanément (workers multiples).

**Intégrité des références vers les comptes (audit #10)** : les collections
métier (`prosopography`, `draft`, `manus`, `prosopography_seq`) ne portent
aucune clé étrangère vers `users` : les fiches elles-mêmes ne stockent ni
`createdBy` ni `updatedBy`, et la trace utilisateur ne vit que dans les logs
et dans les jobs (`createdBy` = email, collection d'exploitation jamais
écrasée en mode contenu). Une restauration « contenu » ne peut donc créer
aucune référence orpheline ; en mode full, les identités portées par
l'archive remplacent celles de la cible, ce qui est le comportement assumé
d'une sauvegarde technique intégrale.

L'IHM admin a une carte dédiée « Restauration de la base » (sélection de
l'archive avec son **type affiché**, avertissement explicite quand le type
est full ou indéterminé, option de sauvegarde de sécurité, confirmation par
saisie du mot `RESTAURER`).

## Routes API

Toutes réservées aux administrateurs (`auth.isAdmin`) :

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/admin/jobs/types` | Types de traitement disponibles. |
| `GET` | `/admin/jobs/backups` | Archives de sauvegarde disponibles dans `BACKUP_DIR` (nom, taille, date, **type** : `contenu`/`full`/`legacy`). |
| `GET` | `/admin/jobs/backups/:name/download` | Télécharge une archive (flux binaire). |
| `DELETE` | `/admin/jobs/backups/:name` | Supprime définitivement une archive de `BACKUP_DIR` (409 si une restauration active l'utilise). |
| `POST` | `/admin/jobs/backups` | Téléverse une archive (ticket #6) : binaire en corps de requête brut, nom d'origine en paramètre `filename`. Le fichier est renommé `studium-upload-<horodatage>-<nom>.tar`, vérifié (`tar -tf`, contenu `.bson.gz`) puis écrit dans `BACKUP_DIR`, où il devient téléchargeable et restaurable. Plafond : `BACKUP_UPLOAD_MAX_BYTES` (2 Go par défaut). Un corps envoyé en formulaire (JSON/urlencoded) est refusé en **415** explicite au lieu de partir en erreur de parsing (ticket #10). |
| `GET` | `/admin/jobs?limit=20` | Derniers jobs. |
| `POST` | `/admin/jobs` | Crée un job `{type, params}` → `202` + job. Pour `backup`/`restore`, `params.mode` (`contenu`/`full`) est validé à la création (**400** explicite sinon). |
| `GET` | `/admin/jobs/:id` | État détaillé + dernières erreurs. |
| `POST` | `/admin/jobs/:id/cancel` | Annulation. |
| `POST` | `/admin/jobs/:id/retry-failed` | Relance uniquement les erreurs. |

**Remontée d'erreurs (ticket #10)** : le handler d'erreur global renvoie
désormais le code HTTP réel de l'erreur (`err.status`/`err.statusCode`,
500 seulement par défaut) et un corps `{message, error}` lisible par l'IHM
(qui lit `message`), au lieu de tout transformer en `500 {error}` muet. Un
compte introuvable derrière un jeton valide répond **401** avec un message
invitant à se reconnecter.

## Worker

- Développement : `npm run worker` (ou `npm run worker:watch`).
- Production : `node worker.js` (bundle webpack), service `studium_worker`
  dans `docker-compose.yml`.
- Variables : `WORKER_POLL_INTERVAL_MS` (2000), `WORKER_HEARTBEAT_MS` (5000),
  `WORKER_STALE_MS` (60000).

Un seul job est exécuté à la fois par worker. Pour augmenter le débit, lancer
plusieurs workers : le `claimNext` est atomique, donc deux workers ne prendront
jamais le même job.
