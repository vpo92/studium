# Audit technique — Studium Parisiense

**Date :** 17 novembre 2026
**Périmètre :** `api/` (Node/Express), `admin/` (PHP), `batchs/` (CLI Node), `neo4j/`, `docker-compose.yml`, CI, scripts et documentation.
**Méthode :** lecture du code, exécution des tests, exécution de la CLI, vérification de la configuration Docker/CI et des fichiers versionnés.
**État du dépôt :** branche `neo4j`, modifications non commitées sur `admin/index.php`, `admin/src/Utils.php`, `api/src/utils/logger.js`, `admin/bin/start.sh`, `api/package*.json`, `api/src/services/graph/config.js`.

> Ce rapport est un plan de maintenance et d'optimisation. Il ne modifie pas le comportement de l'application.

---

## 1. Synthèse exécutive

L'application est fonctionnelle et couvre un périmètre métier riche (prosopographie, recherche, brouillons, manuscrits, graphe Neo4j). Elle souffre cependant d'une **dette technique de plus de 7 ans** : runtime Node 8 (EOL), MongoDB 4.2 (EOL), dépendances de 2017-2019, absence de CI de test, sauvegardes non automatisées, et plusieurs **failles de sécurité critiques**.

### Top 10 des actions à mener en priorité

| # | Action | Criticité | Effort |
|---|--------|-----------|--------|
| 1 | Retirer du dépôt le dump complet `backup_studium_20261029.tar.gz` (430 Mo, contient `users.bson`, `drafts`, toute la base) et le stocker chiffré hors du serveur | **P0** | 1 h |
| 2 | Rotation de tous les secrets exposés (JWT, Neo4j, Sonar, jetons batch, mot de passe admin par défaut) | **P0** | 2-4 h |
| 3 | Fermer les endpoints non authentifiés : `/mongo/executeQuery`, `/admin/dump/:dumpName`, `/prosopography/initGraph`, `/prosopography/parse-text` | **P0** | 0,5 j |
| 4 | Ne plus exposer Neo4j (7474/7687) ni `/graph` publiquement ; changer le mot de passe | **P0** | 2 h |
| 5 | Corriger la LFI de `admin/index.php` (`?page=`) et le path traversal de `router.php` | **P0** | 2 h |
| 6 | Corriger les XSS stockées/réfléchies de l'admin et retirer le JWT du HTML | **P0** | 1-2 j |
| 7 | Corriger l'import batch : il rend la main avant la fin des écritures, et la CLI est cassée sous Linux (imports `RestService`/`MongoService` en majuscules) | **P0/P1** | 1 j |
| 8 | Mettre en place une sauvegarde MongoDB/Neo4j planifiée, hors site, testée (RPO 24 h, RTO 4 h) | **P0/P1** | 2-3 j |
| 9 | Ajouter les index MongoDB manquants (dont `reference` unique, `users.email` unique) après dédoublonnage | **P1** | 0,5 j |
| 10 | Mettre en place la CI (lint + tests + build + scan) et réparer la suite de tests | **P1** | 3-5 j |

### Indicateurs cibles

- 0 vulnérabilité critique/haute non traitée (scan image + dépendances).
- 100 % des routes d'écriture et d'administration derrière authentification + autorisation testée.
- Tests : 0 échec, couverture ≥ 60 % sur les services critiques (parser, auth, recherche, import).
- Performance : p95 API < 300 ms sur les lectures courantes ; fiche < 2 s ; import complet < 15 min.
- Sauvegarde : quotidienne, chiffrée, hors site, restauration testée tous les trimestres.
- Déploiement : image immuable (tag SHA), rollback < 10 min, staging obligatoire.

---

## 2. Sécurité

### 2.1 Constats critiques (P0)

| ID | Constat | Preuve | Impact |
|----|---------|--------|--------|
| S1 | Dump complet de la base (430 Mo) à la racine du dépôt, non chiffré, contenant `users.bson` (emails + hashes), `draft.bson`, `prosopography.bson` | `backup_studium_20261029.tar.gz` | Fuite de données et des credentials si copié/committé |
| S2 | Secrets versionnés : secret JWT, mot de passe Neo4j, token Sonar, JWT batch expirés mais valides comme pattern | `api/config/config.json:12-49`, `docker-compose.yml:61`, `sonar-project.properties:17`, `batchs/src/rawFilesParser/run-*.js` | Usurpation d'identité, accès base |
| S3 | `POST /mongo/executeQuery` sans authentification : requête arbitraire sur n'importe quelle collection | `api/src/routes/mongoRoutes.js:15-16` (auth commentée) | Lecture de `users`, `drafts`, `logs`, DoS |
| S4 | `GET /admin/dump/:dumpName` sans authentification + path traversal | `api/src/routes/adminRoutes.js:111-122` | Téléchargement de n'importe quel fichier lisible ; crash si fichier absent (stream non écouté) |
| S5 | Neo4j exposé sur `0.0.0.0:7474/7687` avec mot de passe en clair ; Browser proxifié sur `/graph/` | `docker-compose.yml:53-76`, `docker-compose.yml:126-146` | Prise de contrôle du graphe, suppression de données |
| S6 | LFI dans le front controller admin : `?page=` est inclus directement | `admin/index.php:37`, `admin/index.php:263` | Exécution de fichiers PHP arbitraires présents sur le serveur |
| S7 | Path traversal/lecture arbitraire dans `router.php` (serveur de dev) | `admin/router.php:5,24` | Lecture de fichiers hors du dossier admin |
| S8 | XSS : valeurs de fiches échappées nulle part, `keyword` réfléchi, textarea d'édition, JSON injecté dans `<script>` | `admin/pages/view/view_properties.php:61,76,119,174,220-256,326`, `admin/pages/recherche.php:9,18,48-51`, `admin/pages/edit.php:22-25` | Vol de session/JWT, actions admin |
| S9 | JWT stocké dans le HTML et utilisé en JavaScript | `admin/pages/common/footer.php:64`, tous les `resources/js/*.js` | Tout XSS exfiltre un token de 4 h |
| S10 | Suppression de fiche via `GET action=delete`, sans jeton CSRF | `admin/pages/delete.php:12,19`, `admin/index.php:232-246` | CSRF : un lien piégé supprime une fiche |
| S11 | `hasRole()` autorise tout le monde : `filteredArray == []` compare des références, jamais vrai | `api/src/services/authService.js:43-47` | Contrôle d'accès défaillant si utilisé (latent aujourd'hui) |
| S12 | `GET /user` accessible à tout utilisateur authentifié (pas seulement admin) | `api/src/routes/userRoutes.js:39` | Fuite des comptes/emails |
| S13 | CORS `*` sur toute l'API | `api/src/server.js:38` | Combinaison dangereuse avec XSS/token navigateur |

### 2.2 Constats élevés (P1)

- **Absence de limitation de débit** sur `/auth/login` et l'admin : brute force / credential stuffing.
- **Sessions PHP non durcies** : pas de `HttpOnly`, `Secure`, `SameSite`, pas de `session_regenerate_id()` après login (`admin/index.php:4`, `:91-94`). Cookie `PHPSESSID` par défaut.
- **JWT décodé sans vérification** côté admin pour construire la session (`admin/index.php:84-94`) ; l'admin ne vérifie ni signature ni expiration.
- **Pages admin non protégées côté serveur** : `?page=supervision|dump|user|draft` s'affichent sans contrôle ; seule l'API bloque ensuite les appels.
- **Path traversal API** : `GET /data/:file` concatène le paramètre et ajoute `.json` (`api/src/routes/routes.js:34-39`).
- **Injection de commandes** : `mongodump` et `zip` via `exec` avec des chaînes interpolées (`api/src/services/mongoService.js:35`, `batchs/src/rawFilesParser/mongoService.js:85,116`).
- **ReDoS / injection de regex** : `indexSearch` construit `new RegExp` depuis l'URL (`prosopographyService.js:86`) ; la recherche avancée n'échappe pas `name`, `status`, `sexe`, `grade` (`prosopographyService.js:295-359,457-474`).
- **DoS non authentifié** : `parse-text` (parsing CPU), `initGraph` (agrégation complète), `getAll` sans plafond.
- **Mots de passe faibles** : PBKDF2-SHA1, 10 000 itérations, comparaison non constant-time (`api/src/models/userModel.js:204-224`). Un compte admin par défaut `admin@studium.dev` / `pass` est créé par la CLI (`batchs/index.js:90-93`).
- **Logs sensibles** : la config complète (dont secrets) est loguée au démarrage (`api/src/server.js:20-21`) ; les payloads API sont logués en clair (`admin/src/Utils.php:99,142`) ; Winston écrit tous les `debug` en base.
- **Headers de sécurité absents** : pas de CSP, HSTS, X-Frame-Options, X-Content-Type-Options. CDN non épinglés (`@latest`, `//unpkg.com`).

### 2.3 Mesures recommandées (ordre d'exécution)

1. **Isoler et chiffrer** le dump, le déplacer hors du dépôt, restreindre ses permissions, puis ajouter `backup*`, `*.tar.gz`, `*.bson` au `.gitignore`.
2. **Rotation** : secret JWT, mot de passe Neo4j, token Sonar, comptes batch. Supprimer les tokens en dur. Neo4j : utilisateur applicatif en lecture seule pour l'API + mot de passe fort.
3. **Fermer le réseau** : publier Neo4j uniquement sur `127.0.0.1` ou le réseau interne ; supprimer `/graph` public ou le protéger (VPN/basic auth). MongoDB : activer `--auth` + utilisateur applicatif dédié.
4. **Verrouiller l'API** :
   - supprimer `/mongo/executeQuery` ou le réserver admin + lecture seule + collections/fields whitelist + `maxTimeMS` ;
   - protéger `GET /admin/dump/:dumpName` par `auth.isAdmin`, valider `dumpName` (`^[A-Za-z0-9._-]+$`), utiliser `res.download` avec `root` ;
   - protéger `initGraph` et `parse-text` (auth + rate limit + taille max) ;
   - `GET /user` → `auth.isAdmin` ;
   - corriger `hasRole` : `roles.some(r => user.role.includes(r))` (et tests unitaires).
5. **Admin** :
   - whitelist des pages (`$pages = ['home','index',...]`) et routage explicite, jamais `include` d'un paramètre ;
   - `htmlspecialchars(..., ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')` sur toutes les sorties, `json_encode(..., JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT)` pour le JS inline ;
   - supprimer `sessionToken` du HTML ; passer par des endpoints PHP serveur (pattern BFF) ou un cookie `HttpOnly` ;
   - `session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict'])`, `session_regenerate_id(true)` au login ;
   - CSRF token sur tous les POST + suppression en POST (jamais en GET) ;
   - ne jamais inclure `router.php` en production ; le supprimer ou le borner ;
   - en-têtes CSP/HSTS/XFO via Nginx + PHP.
6. **Secrets** : variables d'environnement/Docker secrets, pas de `config.json` versionné. Fournir `.env.example`. Ajouter un contrôle de démarrage qui refuse les secrets par défaut.
7. **Journalisation** : logs JSON, `request-id`, utilisateur, route, statut, durée ; jamais de token, mot de passe, payload complet. Rétention et accès restreints.

---

## 3. Intégrité des données et fiabilité

### 3.1 Constats

| ID | Constat | Preuve | Impact |
|----|---------|--------|--------|
| D1 | L'import ne attend pas les écritures : `saveRecord()` est appelé sans `await`, `processStream` résout à `close`, puis `createIndex()` part immédiatement | `simpleParser.js:328-357,391-505` ; `studium.cli.js:45-51` | Import « terminé » avant insertion ; index créé trop tôt ; pertes silencieuses |
| D2 | Les erreurs du parser et des sauvegardes sont avalées (`console.log`) | `simpleParser.js:341-343,474-479,492-496` | Aucun code d'échec, données manquantes invisibles |
| D3 | CLI batch cassée sous Linux : imports `RestService`/`MongoService` en majuscules alors que les fichiers sont `restService.js`/`mongoService.js` | `batchs/src/studium.cli.js:5-6` ; vérifié : `npx babel-node index.js version` → `MODULE_NOT_FOUND` | Import/reindex/backup impossibles en production Linux |
| D4 | `sleep.msleep(200)` par enregistrement, bloquant la boucle d'événements | `restService.js:11,193,225` | 29 000 fiches ⇒ ~1 h 36 minimum |
| D5 | Token batch stocké dans un fichier `tk` et jamais renouvelé ; expiration 4 h | `studium.cli.js:13-24` | Reprise impossible après 4 h ; 401 en milieu d'import |
| D6 | Séquence de référence non atomique (`findOne` puis `update`) | `prosopographyService.js:483-498` ; `draftRoutes.js:101-118` | Références dupliquées en création concurrente |
| D7 | Aucun index unique sur `prosopography.reference`, `draft.reference`, `users.email`, `manus.Num` | recherche `createIndex` : seul l'index texte existe | Doublons, lenteur, course check-then-insert |
| D8 | `importList` manuscrits : `drop()` puis `insertMany` dans `then` **et** `catch` | `api/src/services/manuscritService.js:26-41` | Risque de double insertion ou de base vide ; la route répond avant la fin |
| D9 | Publication d'un brouillon non transactionnelle (update/insert puis delete du brouillon) | `draftRoutes.js:194-224` | Perte ou incohérence si l'étape suivante échoue |
| D10 | Sauvegarde applicative dans `/tmp` (éphémère en conteneur), sans rétention ni vérification | `prosopographyService.js:500-502` ; `mongoService.js:30-41` | Aucune garantie de sauvegarde réelle |
| D11 | MongoDB standalone, sans replica set ni auth | `docker-compose.yml:3-19` | Pas de HA, pas de transactions, pas de PITR |
| D12 | Le graphe Neo4j n'est pas synchronisé lors d'un create/update/publish | aucun appel `syncProsopography` dans les routes/services | Graphe obsolète dès la première édition |
| D13 | Aucune validation de schéma des fiches ; `update()` fait un `save()` du body | `prosopographyService.js:129-135`, `draftRoutes.js` | Corruption possible, champs arbitraires, `$` operators |
| D14 | `manuscritService.importList` et `backup` ne propagent pas toujours les promesses | ibid. | Faux succès |

### 3.2 Recommandations

1. **Refondre le pipeline d'import** :
   - `await saveRecord()` par fiche ou par lot ;
   - file d'attente bornée (`p-limit`, 4-8 requêtes) ;
   - compteur `imported/failed/skipped`, code de sortie non nul si échec ;
   - suppression de `sleep`, remplacé par backoff sur 429/5xx ;
   - reprise par curseur `_id` (`--resume`) plutôt que `skip/limit`.
2. **Atomicité de la séquence** :
   ```js
   const seq = await db.collection('prosopography_seq').findOneAndUpdate(
     {},
     { $inc: { seq: 1 } },
     { returnDocument: 'after', upsert: true }
   );
   ```
   Utiliser la valeur retournée pour `<1a>` et créer la fiche dans la même unité logique (index unique en filet de sécurité).
3. **Index et contraintes** (après nettoyage des doublons) :
   ```js
   db.prosopography.createIndex({ reference: 1 }, { unique: true, name: 'uniq_reference' });
   db.prosopography.createIndex({ 'identity.name.value': 1 });
   db.prosopography.createIndex({ title: 1 });
   db.prosopography.createIndex({ 'extras.activityMediane': 1 });
   db.draft.createIndex({ reference: 1 }, { unique: true });
   db.users.createIndex({ email: 1 }, { unique: true });
   db.manus.createIndex({ Num: 1 }, { unique: true });
   db.manus.createIndex({ REFERENCES_SOURCES: 1 });
   ```
   Attention : un seul index texte par collection ; le `$**` actuel est coûteux. Définir les champs réellement recherchés.
4. **Migrations** : adopter `migrate-mongo` (ou équivalent) pour index, dédoublonnage, normalisations. Ne jamais modifier la base à la main sans trace.
5. **Transactions** : MongoDB replica set + `withTransaction` pour publish et création ; à défaut, rendre les opérations idempotentes et ordonnées (créer/mettre à jour d'abord, supprimer le brouillon en dernier, avec journal).
6. **Sauvegardes** :
   - `mongodump --gzip --archive` quotidien, chiffré (age/GPG), copie S3/objet hors site ;
   - rétention 7 j / 4 semaines / 12 mois ;
   - dump Neo4j (`neo4j-admin database dump`, base à l'arrêt en Community) ou export Cypher ;
   - test de restauration trimestriel documenté ;
   - alerte si le job échoue ou si la taille dévie.
7. **Synchronisation graphe** : hook après `create/update/publish` (événement/outbox + worker) ou commande de resync planifiée, avec compteur de retard.

---

## 4. Performance

### 4.1 Constats

| ID | Constat | Preuve | Impact |
|----|---------|--------|--------|
| P1 | N+1 HTTP : une requête `/manuscrit/{id}` par témoin lors du rendu d'une fiche | `admin/pages/view/view_properties.php:323-328`, `ManuscritService.php:13-17` | Fiche 487 = 727 témoins ⇒ jusqu'à 727 appels cURL séquentiels |
| P2 | Aucun index métier (référence, nom, titre, médiane) | cf. D7 | Scans complets sur 15-29 k fiches |
| P3 | `limit(0)` = pas de limite pour index, exports, requêtes Mongo | `prosopographyService.js:45-97`, `mongoService.js` | Réponses énormes, mémoire |
| P4 | Listes renvoient les documents complets, `raw` inclus ; `X-Total-Count` = taille de page | `prosopographyService.js:32-42` ; routes `GET /` | Bande passante et latence inutiles |
| P5 | Import : `skip/limit` (O(n²)), transaction par fiche, 13 contraintes de schéma rejouées à chaque fiche | `import-neo4j.js:184-199,385-457` ; `graph/writer.js:417-419` | Import complet très lent |
| P6 | Recherche avancée par regex non ancrées sur champs non indexés | `prosopographyService.js:295-359,457-474` | CPU Mongo, ReDoS |
| P7 | Requête graphe `[*1..5]` sans limite de nœuds/relations sur des hubs (lieux, œuvres) | `graph/reader.js:138-155` | Réponse potentiellement gigantesque, OOM |
| P8 | Pas de compression HTTP, pas de cache/ETag, pas de cache des pages publiques | `api/src/server.js`, Nginx | Latence et charge |
| P9 | Admin index alphabétique non paginé : charge toutes les fiches de la lettre | `FicheService.php:13-19` | Pages lentes pour A, B, etc. |
| P10 | Dépendances front chargées depuis CDN non épinglés (`@latest`) | `admin/pages/common/header.php:11-38`, pages Vue | Latence, panne CDN, supply chain |

### 4.2 Recommandations

1. **Supprimer le N+1 manuscrits** : endpoint batch `GET /manuscrit?ids=a,b,c` (ou `POST /manuscrit/list`), projection `Num, Ville, Bibliotheque, Cote`, cache mémoire/Redis avec TTL, ou inclure les métadonnées au moment de l'indexation de la fiche.
2. **Index** : cf. section 3.2 ; vérifier avec `explain('executionStats')` avant/après.
3. **Pagination systématique** : `page`/`rows` validés (1..100), `maxTimeMS`, `countDocuments` pour le total, projection par défaut sans `raw`. Exposer `?include=raw` si nécessaire.
4. **Recherche** : échapper toutes les valeurs (`escapeRegExp` partout), ancrer les regex, stocker des champs normalisés (`name_normalized`, `title_normalized`) avec collation, ou passer à Atlas Search/Elasticsearch pour la recherche avancée.
5. **Graphe** : index `PhysicalPerson.reference` et `mongo_id`, profondeur par défaut 1 / max 2 en API publique, `LIMIT` explicite (ex. 500 nœuds), timeout de requête, cache par référence + version.
6. **Import** : curseur + lots + `UNWIND`, contraintes créées **une seule fois** (`--init-schema`), parallélisme contrôlé, transaction par lot de N fiches, métriques. Objectif < 15 min pour 29 k fiches.
7. **HTTP** : activer gzip/brotli, `Cache-Control`/ETag sur les lectures publiques, cache Nginx 60 s pour l'index et les fiches, invalidation au publish. Ajouter `compression` côté Express pour les réponses JSON.
8. **Front** : auto-héberger/épingler les bibliothèques (Vue, Bootstrap, Leaflet, Cytoscape), les bundler, activer le cache long avec hash. Retirer `@latest`.
9. **Mesurer** : ajouter un benchmark reproductible (k6/autocannon) sur index, recherche, fiche, graphe ; consigner p50/p95 avant chaque optimisation.

---

## 5. Dette technique et dépendances

### 5.1 Versions observées

| Composant | Version actuelle | État | Cible recommandée |
|-----------|------------------|------|--------------------|
| Node.js API | 8.17.0 (`api/Dockerfile`) | EOL depuis 12/2019 | Node 22 LTS |
| Node.js batch | 12+ (doc) / exécuté localement | EOL | Node 22 LTS |
| Express | 4.16.2 | ancienne, failles corrigées depuis | 4.21+ ou 5.x |
| Mongoose | 5.3.15 | EOL | 8.x |
| Driver MongoDB | 2.2.36 | EOL, très ancien | 6.x |
| MongoDB | 4.2.22 | EOL 04/2023 | 7.0/8.0 (upgrade séquentiel 4.2→5→6→7) |
| Neo4j | `5-community` non épinglé | non reproductible | 5.26 LTS ou 2025.x, tag précis |
| neo4j-driver | 4.4.11 | ancien | 5.x/6.x |
| jsonwebtoken | 8.4.0 | CVE connues | 9.x |
| uuid | 3.2.1 | ancien | 11.x |
| Babel / webpack | Babel 6 / webpack 3 | EOL | esbuild ou Node natif |
| PHP | image 8.3 | correct | 8.4/8.5, Composer |
| Bootstrap | 4.4 | ancien | 5.x |
| Vue | 2.x | EOL 12/2023 | Vue 3 ou abandon de Vue |
| Nginx | `alpine` flottant | non reproductible | tag précis + digest |

### 5.2 Autres dettes

- **Flow** (`flow-bin` 0.61) n'est plus maintenu dans cette version ; il ne protège plus réellement. Choisir : TypeScript (recommandé) ou JSDoc + `// @ts-check`, et supprimer Flow.
- **Deux parseurs** coexistent (`parser.js` et `simpleParser.js`) ; seul `simpleParser` est utilisé. Supprimer le code mort et les scripts à token en dur (`run-web.js`, `run-backup.js`, `run-import-file.js`, `run-re-index.js`).
- **Couplage API → batchs** : l'API importe `../../../batchs/src/...` (`prosopographyService.js:5-9`), ce qui impose un contexte Docker racine et mélange les responsabilités. Extraire un package `packages/parser` (workspace npm) partagé.
- **`request`** est utilisé par le batch mais absent de `package.json` (résolu via dépendance transitive) ; package déprécié. Remplacer par `fetch` natif/undici.
- **Bluebird/promisifyAll** : inutile avec Node moderne, source de bugs (ex. `bluebird.promisifyAll(mongoose)`).
- **Lockfile** : `api/package-lock.json` est repassé en `lockfileVersion: 1` (modification non commitée) ; `npm ci` émet un avertissement et re-résout les versions. Regénérer en v3 avec npm 10/11 et utiliser `npm ci` partout.
- **Root `package.json`** : scripts et dépendances d'une ancienne application `web/` qui n'existe plus ; `jest.config.js` et `setup-jest.js` aussi. Nettoyer ou transformer en workspace.
- **Fichiers morts** : `api/src/services/fileService.js` (stubs), `testCarto*` (route commentée), `admin/mock` (hors image), `test.tmp`, `scripts/doublon.csv`, artefacts `api/docker/build`.
- **Docker** : `npm install` au lieu de `npm ci` ; images `latest` ; admin tourne en root ; pas de healthcheck API dans Compose (seulement Dockerfile) ; pas de `depends_on` conditionnel ; pas de limites mémoire/CPU ; logs non bornés pour Mongo/API/admin.
- **Nginx** : configuration inline, `$` non échappé dans le bloc `/graph/` (`docker-compose.yml:133-138`) alors que les autres blocs utilisent `$$` ⇒ variables probablement vides à l'exécution. Externaliser `nginx.conf`, ajouter gzip, cache, headers, timeouts.
- **CI** : workflows uniquement `workflow_dispatch`, pas de tests, actions non épinglées par SHA, pas de scan d'image/SBOM, pas de Dependabot/Renovate. Travis est obsolète et référence un dossier `web/` disparu. Token Sonar versionné.
- **Versions applicatives** incohérentes : api 0.3.0, admin 0.4.12, batchs 1.4.4 ; un seul tag `1.0.0`. Définir une version produit commune et des tags d'image immuables.

### 5.3 Plan de modernisation progressif

1. **Étape A — sans changer le métier** : Node 22, `npm ci`, esbuild à la place de webpack/Babel, Express 4.21, driver Mongo 6, Mongoose 8, neo4j-driver 5, jsonwebtoken 9, uuid 11, `fetch` au lieu de `request`. Tests de non-régression avant/après.
2. **Étape B — infrastructure** : MongoDB 7 (upgrade séquentiel avec dump/restore testé), Neo4j 5.26 LTS, Nginx épinglé, images distroless/alpine non-root, healthchecks, limites.
3. **Étape C — applicatif** : extraire les packages, supprimer Flow/Babel, migrer l'admin vers PHP 8.4 + Composer + Guzzle + PHPUnit, ou préparer une migration progressive vers une UI moderne (Vue 3/React/Next) avec BFF.
4. **Étape D — données** : schéma JSON Mongo, migrations, recherche dédiée, synchronisation graphe événementielle.

Ne pas faire de « big bang » : chaque étape doit être déployée et vérifiée séparément, avec un dump préalable.

---

## 6. Tests, CI/CD et qualité

### 6.1 Constats vérifiés

- `api` : 5 suites, 3 en échec.
  - `logger.js` plante sans `MONGODB_CONNECTION_STRING` car `config` n'est pas importé (`logger.js:17`) ;
  - `userModel`/`authService` dépendent d'un MongoDB local et de modules incompatibles avec Node 26 (`buffer-equal-constant-time`) ;
  - les tests attrapent les erreurs et les transforment en succès (`expect(err).toBeUndefined()` dans `catch`) ⇒ faux positifs.
- `batchs` : 10 suites, 2 assertions en échec (virgule finale dans `places`, attendu `"Paris,"` vs reçu `"Paris"`).
- Aucun test PHP, aucun lint exécuté, aucune couverture publiée.
- Aucun test dans la CI ; les workflows ne font que construire et pousser des images manuellement.
- Pas de tests d'intégration API (Mongo/Neo4j), pas de tests de contrat OpenAPI, pas de tests E2E admin.

### 6.2 Recommandations

1. **Réparer la base de test** : `mongodb-memory-server` ou Testcontainers, base éphémère par suite, nettoyage, timeouts adaptés. Ne jamais swallower une erreur : `expect(...).rejects` ou `await expect(...).rejects.toThrow()`.
2. **Organiser** : tests unitaires (parser, normalisation, auth, recherche) et tests d'intégration (routes + Mongo/Neo4j). Découpler `logger` de la base en test (transport mémoire).
3. **Ajouter PHPUnit** pour `Utils`, `FicheService`, `UserService`, `MessageUtils`, et PHPStan niveau 6 + PHP-CS-Fixer.
4. **Lint JS** : ESLint 9 + Prettier, `lint-staged`, hook pre-commit. Remplacer Flow par TypeScript/JSDoc.
5. **CI sur PR/push** :
   - `npm ci` (ou workspace), lint, tests, build Docker ;
   - services MongoDB et Neo4j ;
   - scan Trivy/Grype sur l'image, `npm audit` (bloquant sur critical/high), Gitleaks, Semgrep/CodeQL ;
   - publication d'images uniquement sur tag, avec tag SHA + semver + `latest` contrôlé ;
   - tests de fumée (`/`, `/docs`, `/prosopography/487`, `/prosopography/487/graph`) ;
   - Dependabot/Renovate pour les mises à jour.
6. **Qualité** : seuils de couverture (services critiques ≥ 70 %), rapport de tests, badge, protection de `master`, revue obligatoire, commits conventionnels, CHANGELOG.
7. **Tests de données** : conserver les fixtures lourdes hors du dépôt (LFS ou téléchargement CI) ; réduire les fixtures à des cas représentatifs.

---

## 7. Exploitation, sauvegardes et observabilité

### 7.1 Constats

- Sauvegarde manuelle uniquement ; dump applicatif dans `/tmp` ; dump racine de 430 Mo non chiffré.
- Pas de politique de rétention, pas de copie hors site, pas de test de restauration.
- Pas de supervision : pas de métriques, pas d'alertes, pas de healthcheck applicatif profond, pas de Sentry.
- Logs : console + collection MongoDB capped, pas de rotation/centralisation ; pas de correlation ID.
- `GET /admin/dump/:dumpName` peut faire crasher l'API si le fichier n'existe pas (stream `error` non géré).
- Disque à **86 %** (15 Go libres) : marge insuffisante pour dumps, images et croissance.
- Docker Compose : `restart` manquant pour admin, pas de healthchecks pour Mongo/API/admin, pas de `depends_on` conditionnel, pas de limites, réseau `npm-net` externe partagé.
- Pas de staging, pas de procédure de rollback, pas de migration de base outillée.
- Pas de TLS/headers dans le Nginx fourni ; dépend d'un proxy externe non documenté.

### 7.2 Recommandations

1. **Sauvegardes** : job quotidien (cron/systemd timer ou sidecar), `mongodump --gzip --archive`, chiffrement, envoi S3/MinIO, vérification d'intégrité, rétention, alertes, runbook de restauration. Sauvegarder aussi Neo4j et les volumes (`neo4j_data`).
2. **Haute disponibilité** : MongoDB en replica set (3 nœuds ou Atlas), Neo4j selon le budget (Community = pas de clustering ; accepter l'indisponibilité ou passer Enterprise).
3. **Supervision** : Prometheus/Grafana ou équivalent, métriques HTTP (latence, 4xx/5xx), MongoDB (`serverStatus`, connexions, slow queries), Neo4j, jobs d'import/backup (succès, durée, volumes), espace disque, mémoire. Alertes : API down, taux d'erreur > 1 %, backup échoué, disque > 80 %, latence p95 > 1 s.
4. **Logs** : JSON structuré, `request-id`, rotation, centralisation (Loki/ELK), rétention 30-90 j, redaction des secrets.
5. **Santé** : `/health/live` (process) et `/health/ready` (Mongo + Neo4j + espace disque) ; healthchecks Compose ; redémarrage automatique.
6. **Déploiement** : staging, images immuables (digest/SHA), déploiement bleu/vert ou rolling, migration avant démarrage, rollback testé, sauvegarde pré-migration.
7. **Réseau** : réseaux Docker dédiés (`front`, `back`), pas de `npm-net` partagé, pas de ports base publiés, TLS terminé au proxy, HSTS.
8. **Ressources** : limites mémoire/CPU (Neo4j 1 Go de heap + 1 Go pagecache sur une VM à 5,8 Go est déjà tendu), `max-size`/`max-file` sur tous les services, surveillance du disque.

---

## 8. Neo4j et modèle de graphe

Points positifs : modèle DAPHNE documenté (`neo4j/graph_model.md`), normalisation `norm_key`, contraintes d'unicité, scripts de vérification et tests dédiés.

Recommandations :

1. **Index** : créer `CREATE INDEX physical_person_reference IF NOT EXISTS FOR (n:PhysicalPerson) ON (n.reference)` et éventuellement `mongo_id`. La route de lecture filtre par `reference` sans index.
2. **Contraintes hors import** : ne pas exécuter les 13 `CREATE CONSTRAINT` à chaque fiche (`writer.js:417`). Les créer une fois au déploiement/`--init-schema`, puis les vérifier.
3. **Requêtes bornées** : limiter la profondeur exposée (1 par défaut, 2 max), ajouter `LIMIT`/timeout, éviter `[*1..5]` sur des hubs. Envisager `apoc.path.expandConfig` avec `limit` et `relationshipFilter`.
4. **Transactions par lot** : regrouper plusieurs fiches par transaction (`UNWIND`), avec retry sur deadlock ; mesurer le débit.
5. **Synchronisation** : aujourd'hui manuelle. Ajouter un job de resynchronisation (références modifiées depuis `updated_at`) et un indicateur de retard. À terme, outbox dans Mongo + worker.
6. **Suppression** : `CLEAR_FACTOIDS` fait un `DETACH DELETE` ; vérifier qu'aucun nœud partagé ne devient orphelin. Ajouter un job de nettoyage des nœuds sans relation et des `Document` obsolètes.
7. **Sécurité** : utilisateur API en lecture/écriture limité, pas d'accès Browser public, mot de passe fort, chiffrement du volume si possible.
8. **Sauvegarde** : dump/restore documenté, testé, versionné avec le schéma.

---

## 9. Documentation et gouvernance

### 9.1 Constats

- `doc.md` décrit Node 8+, PHP 7+, MongoDB 3+, Travis, et ne mentionne pas Neo4j, Nginx, les variables d'environnement, la sécurité ni les sauvegardes.
- `README.md` donne une installation manuelle obsolète (PHP 7, Node 12, `npm start`), sans Docker.
- OpenAPI (`api/docs/openapi.json`, `api-hmd.yml`) est incomplet : la route `/prosopography/{reference}/graph` manque, `security` global est absent, les erreurs ne sont pas normalisées.
- Pas de `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, fichier `LICENSE` (MIT annoncé mais absent).
- Pas de runbook : import, re-index, backup, restauration, incident, montée de version.
- Pas d'ADR (décisions d'architecture) pour le modèle Neo4j, le format FJPG, le choix PHP/Node.

### 9.2 Recommandations

1. Réécrire `README.md` : démarrage Docker en 5 commandes, variables, ports, prérequis, dépannage.
2. Mettre à jour `doc.md` avec l'architecture réelle (Nginx, Neo4j, volumes, réseaux) et les versions cibles.
3. Documenter les procédures :
   - import d'un fichier FJPG et reprise ;
   - re-index et recalcul du graphe ;
   - sauvegarde/restauration MongoDB et Neo4j ;
   - rotation des secrets ;
   - déploiement/rollback.
4. Générer/valider l'OpenAPI depuis le code ou via un test de contrat ; ajouter les schémas d'erreur, l'authentification, les exemples, la route graphe.
5. Ajouter `SECURITY.md` (signalement, périmètre, délais), `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`.
6. Tenir un journal des décisions (ADRs) dans `docs/adr/`.

---

## 10. Plan d'action 30 / 60 / 90 jours

### Jours 0-3 — « arrêter l'hémorragie »

- [ ] Déplacer/chiffrer le dump, l'ajouter au `.gitignore`.
- [ ] Rotation des secrets (JWT, Neo4j, Sonar, comptes batch).
- [ ] Fermer Neo4j (ports + `/graph`), activer l'auth MongoDB.
- [ ] Fermer `/mongo/executeQuery` et `/admin/dump/:dumpName`.
- [ ] Corriger la LFI admin + path traversal `router.php` + `data/:file`.
- [ ] Supprimer le token du HTML, CSRF, sessions durcies, suppression en POST.
- [ ] Corriger `logger.js` (`config` non importé) et retirer le log de config.
- [ ] Corriger les imports de casse de la CLI batch.
- [ ] Vérifier que le dump racine est bien sauvegardé ailleurs avant suppression.

### Jours 4-30 — « stabiliser et sécuriser »

- [ ] XSS : échappement systématique, CSP, `htmlspecialchars`, JSON flags.
- [ ] Whitelist des pages admin + garde d'autorisation serveur par page.
- [ ] Corriger `hasRole`, `GET /user` admin, rate limiting login/API.
- [ ] Pipeline d'import fiable (await, erreurs, reprise, sans `sleep`).
- [ ] Index uniques + dédoublonnage + migration `reference`.
- [ ] Sauvegarde quotidienne chiffrée + test de restauration.
- [ ] Tests : réparer la suite existante, ajouter tests auth/parser/import/index.
- [ ] CI minimale (lint, tests, build, scan).
- [ ] Monitoring de base + healthchecks + alertes disque/backup.

### Jours 31-60 — « optimiser »

- [ ] Supprimer le N+1 manuscrits (endpoint batch + cache).
- [ ] Pagination/plafonds/projections partout ; suppression de `limit(0)`.
- [ ] Compression HTTP + cache Nginx + ETag.
- [ ] Optimiser l'import Neo4j (curseur, lots, contraintes une fois, < 15 min).
- [ ] Index Neo4j + limites de profondeur/timeout + cache graphe.
- [ ] Ajouter le staging, les images immuables, le rollback.
- [ ] Nettoyer le code mort, les scripts à token, les artefacts, le lockfile.
- [ ] Mettre à jour la documentation et l'OpenAPI.

### Jours 61-90 — « moderniser »

- [ ] Node 22, Express 4.21/5, Mongoose 8, driver Mongo 6, neo4j-driver 5, jsonwebtoken 9.
- [ ] MongoDB 7/8 (upgrade testé), Neo4j LTS épinglé.
- [ ] Suppression de Babel 6/webpack 3 au profit d'esbuild.
- [ ] PHP 8.4 + Composer + PHPUnit + PHPStan.
- [ ] Décision Vue 3 / BFF ou refonte progressive de l'admin.
- [ ] Synchronisation graphe événementielle.
- [ ] Schéma JSON Mongo + migrations outillées.
- [ ] Tests E2E, tests de charge, revue de sécurité externe.

---

## 11. Backlog détaillé (tickets proposés)

| Priorité | Ticket | Fichiers principaux | Estimation |
|----------|--------|---------------------|------------|
| P0 | Sécuriser/archiver le dump racine | racine | 1 h |
| P0 | Rotation des secrets + suppression des tokens en dur | `config.json`, `docker-compose.yml`, `sonar-project.properties`, `batchs/src/rawFilesParser/run-*.js` | 0,5 j |
| P0 | Fermer les endpoints non authentifiés | `mongoRoutes.js`, `adminRoutes.js`, `prosopographyRoutes.js` | 0,5 j |
| P0 | Corriger LFI/path traversal admin/API | `admin/index.php`, `admin/router.php`, `routes.js` | 0,5 j |
| P0 | Corriger XSS + retirer le token du HTML + CSRF | `view_properties.php`, `recherche.php`, `edit.php`, `footer.php`, JS | 1,5 j |
| P0 | Durcir sessions PHP + rate limiting | `index.php`, `Utils.php`, API `server.js` | 0,5 j |
| P0 | Réparer l'import batch (await/erreurs/casse) | `simpleParser.js`, `studium.cli.js`, `restService.js` | 1 j |
| P1 | Corriger `hasRole` + tests | `authService.js` | 2 h |
| P1 | Index Mongo + migration | `prosopographyService.js`, `scripts/migrations` | 0,5 j |
| P1 | Séquence atomique + unicité | `prosopographyService.js`, `draftRoutes.js` | 0,5 j |
| P1 | Corriger `importList` manuscrits + publish transactionnel | `manuscritService.js`, `draftRoutes.js` | 0,5 j |
| P1 | Sauvegarde planifiée + restauration testée | ops | 2-3 j |
| P1 | CI + tests réparés | `.github/workflows`, `api/tests`, `batchs/tests` | 3-5 j |
| P1 | Monitoring/alerting + healthchecks | `server.js`, compose, ops | 2 j |
| P1 | N+1 manuscrits | `view_properties.php`, `ManuscritService.php`, API | 1-2 j |
| P2 | Pagination/plafonds/projections | services API | 1-2 j |
| P2 | Compression/cache HTTP | `server.js`, Nginx | 0,5 j |
| P2 | Optimisation import Neo4j | `import-neo4j.js`, `writer.js` | 2-3 j |
| P2 | Index Neo4j + requêtes bornées | `reader.js`, `writer.js` | 1 j |
| P2 | Nettoyage code mort/artefacts/lockfile | plusieurs | 1 j |
| P2 | Doc/OpenAPI/runbooks | docs | 2 j |
| P3 | Node 22 + dépendances majeures | API/batch | 5-10 j |
| P3 | MongoDB 7 + Neo4j LTS | ops | 2-4 j |
| P3 | PHP 8.4/Composer/PHPUnit | admin | 3-5 j |
| P3 | Refonte UI / Vue 3 / BFF | admin | à cadrer |

**Total indicatif : 40-60 jours-homme** pour le socle P0/P1/P2, hors refonte UI.

---

## 12. Checklist « définition de terminé » pour chaque correctif

- [ ] Test automatisé ajouté (unitaire ou intégration) et échoue sans le correctif.
- [ ] Aucun secret ni donnée personnelle dans les logs/diffs.
- [ ] Revue de code par une seconde personne.
- [ ] Documentation/runbook mis à jour.
- [ ] Déployé en staging, test de fumée OK.
- [ ] Sauvegarde effectuée avant migration de données.
- [ ] Plan de rollback écrit.
- [ ] Monitoring/alerte en place si le correctif touche la disponibilité.

---

## 13. Décisions à prendre

1. **API de lecture publique** : conserver l'accès public (index, recherche, fiche) avec rate limiting, ou réserver aux utilisateurs ? Cela conditionne le design auth/CORS/cache.
2. **Graphe Neo4j** : vitrine publique ou outil interne ? Si public, prévoir un utilisateur read-only, des requêtes bornées et un cache ; sinon, le retirer d'Internet.
3. **Hébergement** : budget pour un MongoDB replica set/Atlas et un stockage objet pour les backups ? Sinon, accepter et documenter le RPO/RTO dégradés.
4. **Modernisation de l'admin** : maintenir PHP (rapide, faible risque) ou préparer une refonte (Vue 3/Next + BFF) ? Recommandation : maintenir PHP à court terme, refonte après stabilisation.
5. **Recherche** : rester sur l'index texte MongoDB ou introduire Atlas Search/Elasticsearch ? À trancher après mesure des volumétries et des besoins (facettes, tolérance aux fautes).

---

## 14. Commandes utiles pour vérifier l'état

```bash
# Tests (constat actuel : échecs)
cd api && npx jest --config=jest.config.json --runInBand
cd batchs && npx jest --runInBand

# CLI batch (constat actuel : MODULE_NOT_FOUND)
cd batchs && npx babel-node index.js version

# Lint PHP
find admin -name '*.php' -print0 | xargs -0 -n1 php -l

# Vulnérabilités (après mise à jour du lockfile)
cd api && npm audit --omit=dev
cd batchs && npm audit --omit=dev

# Poids du dépôt / artefacts
du -sh .git api/node_modules batchs/node_modules
git count-objects -vH
```
