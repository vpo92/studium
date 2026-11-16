# Ingestion Neo4j — modèle DAPHNE v2

Ce dossier contient les fiches de test `487.json` (Alexander de Villa Dei) et
`50875.json` (Aegidius Romanus), le schéma cible `schemaDAPHNE_v2.jpg`, et les
requêtes de validation.

Le script d'ingestion se trouve dans le service API :

- `api/scripts/import-neo4j.js` : point d'entrée CLI ;
- `api/src/services/graph/` : extraction section par section, normalisation,
  construction du modèle et écriture Cypher.

## Modèle projeté

Le modèle reprend les entités principales du schéma DAPHNE en supprimant les
noeuds intermédiaires `Participate`, `Named` et `TimeInterval`.

| Donnée source | Projection Neo4j |
| --- | --- |
| `identity` | `(:PhysicalPerson)`, `(:Name)` + relations `MAIN_NAME` / `NAMED` ; `datesOfLife` portées par `life_start` / `life_end` |
| `origin`, `relationalInsertion`, `curriculum`, `ecclesiasticalCareer`, `professionalCareer`, `travels`, `commissions` | un `(:Factoid)` par étape, relié aux `(:Place)`, `(:Zone)`, `(:MoralEntity)`, `(:Person)` cités et aux `(:Document)` sources |
| `textualProduction` | `(:Document {doc_type:'WORK'})`, `(:Exemplaire)`, `(:Edition)`, `(:Incipit)` |
| `discussed*` | même projection, avec `attribution = 'rejected'` et relation `PRODUCED {attribution:'rejected'}` |
| `bibliography` | `(:Document {doc_type:'SOURCE'})` + relation `HAS_BIBLIOGRAPHY` |

Règles appliquées :

- nettoyage des balises FJPG (`$`, `£`, `%`, `*`, `&`, tabulations) et des
  ponctuations finales ;
- clé de fusion canonique `norm_key` : minuscules, sans accents, sans
  ponctuation. Les années entre parenthèses des références courtes sont
  ignorées pour fusionner `WEIJERS: 1 (1994), 56-58.` et
  `WEIJERS: 1, 56-58.` ;
- dates portées directement sur `(:Factoid)`, `(:Document)` et `(:Edition)` ;
- rôles et certitudes portés par les relations (`AT_PLACE`, `HAS_ROLE_IN`,
  `CITES`, `REFERS_TO`, `PRODUCED`, `HAS_FACTOID`) ;
- `MERGE` uniquement sur `norm_key` (ou `mongo_id` pour la personne) ;
- les `(:Factoid)` de la fiche sont supprimés puis recréés à chaque import.

## Utilisation

La connexion est lue depuis `api/.env` (fichier local ignoré par git) :

```dotenv
NEO4J_URI=bolt://bolt.vincentpoupet.fr:443
NEO4J_USER=neo4j
NEO4J_PASSWORD=...
NEO4J_DATABASE=neo4j
```

Un modèle est fourni dans `api/.env.example`. Le script charge
automatiquement `api/.env`, puis les variables d'environnement déjà définies
ont priorité. Un fichier alternatif peut être passé avec `--env-file`.

Depuis `api/`, la commande la plus courte importe directement une fiche :

```bash
npm run graph:import:487
npm run graph:import:50875
```

Autres formes :

```bash
npm run graph:import -- --file ../neo4j/50875.json --verify
npm run graph:dry-run -- --file ../neo4j/50875.json
```

Équivalent sans npm :

```bash
node scripts/import-neo4j.js --file ../neo4j/50875.json --verify
```

Options utiles :

- `--dry-run` : construit le graphe et affiche le résumé sans écrire en base ;
- `--verify` : exécute les contrôles d'intégrité après import ;
- `--uri`, `--user`, `--password`, `--database` : surchargent les variables
  d'environnement.

Le code de sortie vaut `2` si la vérification échoue.

## Import complet de MongoDB

Depuis `api/`, cette commande parcourt toute la collection `prosopography` et
importe chaque fiche dans Neo4j :

```bash
npm run graph:import:all
```

Équivalent sans npm (l'URL MongoDB peut aussi venir de
`MONGODB_CONNECTION_STRING` ou `MONGO_URL`) :

```bash
MONGODB_CONNECTION_STRING=mongodb://studium_mongo:27017/studium \
  node scripts/import-neo4j.js --mongo
```

Options utiles :

- `--limit <n>` : traite seulement les `n` premières fiches (test) ;
- `--skip <n>` : reprend après les `n` premières fiches ;
- `--batch-size <n>` : taille des lots lus dans MongoDB (défaut : 100) ;
- `--collection <nom>` : collection source (défaut : `prosopography`) ;
- `--mongo-url <url>`, `--mongo-db <nom>` : surchargent la connexion MongoDB ;
- `--dry-run` : construit les graphes et affiche un total agrégé, sans écrire
  dans Neo4j.

Exemple de test sans écriture :

```bash
node scripts/import-neo4j.js --mongo --dry-run --limit 10
```

Comportement :

- les fiches sans champ `reference` sont ignorées et comptées dans le rapport ;
- les références présentes en doublon dans MongoDB sont signalées au démarrage
  (elles sont importées telles quelles, avec des `mongo_id` distincts) ;
- un échec sur une fiche n'interrompt pas l'import : l'erreur est consignée dans
  le rapport (50 exemples maximum) et le code de sortie vaut `1` ;
- l'import est réexécutable : chaque fiche remplace ses propres `Factoid` et les
  autres nœuds sont fusionnés par `norm_key` ;
- en mode `--mongo`, la vérification par fiche est désactivée par défaut car
  elle est très coûteuse sur ~29 000 fiches. Pour l'activer :

```bash
npm run graph:import:all:verify
```

## Validation

Les contrôles de `--verify` sont génériques : les volumes attendus sont calculés
à partir de la fiche (factoids, noms, œuvres, témoins, éditions, incipits,
liens bibliographiques) puis comparés à la base. S'y ajoutent l'absence de
doublon de lieu/source et l'absence de noeud `TimeInterval`, `Participate` ou
`Named`.

Requêtes Cypher prêtes à l'emploi :

```bash
cypher-shell -u neo4j -p secret -f neo4j/validate-487.cypher
cypher-shell -u neo4j -p secret -f neo4j/validate-50875.cypher
```

Résultat attendu pour `487` :

- 1 `PhysicalPerson` et 8 `Factoid` ;
- 16 oeuvres (dont 3 rejetées), 727 témoins, 60 éditions, 11 incipits ;
- un seul noeud `Place` pour `Paris` et un seul pour `Avranches` ;
- un seul `Document` source `WEIJERS: 1, 56-58` ;
- aucun `TimeInterval`, `Participate` ou `Named`.

Résultat attendu pour `50875` :

- 1 `PhysicalPerson` (vie 1245-1316, activité 1265-1316) et 37 `Factoid`
  (`origin` 2, `relationalInsertion` 2, `curriculum` 5,
  `ecclesiasticalCareer` 17, `professionalCareer` 6, `travels` 4,
  `commissions` 1) ;
- 178 oeuvres (dont 19 rejetées), 1 815 témoins, 260 éditions, 135 incipits ;
- 1 209 `Document` sources et 775 liens `HAS_BIBLIOGRAPHY` ;
- aucun doublon de lieu/source, aucun noeud intermédiaire interdit.
