#!/usr/bin/env node
/**
 * Import de fiches prosopographiques dans Neo4j.
 *
 * Deux sources sont possibles :
 *   - un fichier JSON (`--file`) ;
 *   - l'intégralité de la collection MongoDB (`--mongo`).
 *
 * Exemples :
 *   node scripts/import-neo4j.js --file ../neo4j/487.json --verify
 *   node scripts/import-neo4j.js --file ../neo4j/487.json --dry-run
 *   node scripts/import-neo4j.js --mongo --limit 10
 *   node scripts/import-neo4j.js --mongo --dry-run --limit 10
 */

const path = require('path');
const fs = require('fs');

const {
  getConfig,
  createDriver,
  loadEnvFile,
  syncProsopography,
  readJsonFile,
  verifyImport,
  summarizeGraph,
  buildGraph,
} = require('../src/services/graph');

const BOOLEAN_FLAGS = [
  'dry-run',
  'verify',
  'no-verify',
  'help',
  'mongo',
];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.indexOf('--') !== 0) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    if (BOOLEAN_FLAGS.indexOf(key) >= 0) {
      args[key] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && next.indexOf('--') !== 0) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/import-neo4j.js [options]

Source :
  --file <path>         Fiche JSON (défaut: ../../neo4j/487.json)
  --mongo               Importe toutes les fiches de la collection MongoDB
  --mongo-url <url>     URL MongoDB (défaut: MONGODB_CONNECTION_STRING, MONGO_URL ou config)
  --mongo-db <name>     Base MongoDB (défaut: nom de la base dans l'URL)
  --collection <name>   Collection MongoDB (défaut: prosopography)
  --skip <n>            Ignore les n premières fiches (reprise d'un import)
  --limit <n>           Limite le nombre de fiches traitées
  --batch-size <n>      Taille des lots lus dans MongoDB (défaut: 100)

Neo4j :
  --env-file <path>     Fichier .env à charger (défaut: api/.env)
  --uri <bolt-uri>      URI Bolt (défaut: NEO4J_URI ou bolt://localhost:7687)
  --user <user>         Utilisateur (défaut: NEO4J_USER ou neo4j)
  --password <pass>     Mot de passe (défaut: NEO4J_PASSWORD)
  --database <name>     Base Neo4j (défaut: NEO4J_DATABASE ou neo4j)
  --dry-run             Construit les graphes sans écrire dans Neo4j
  --verify              Lance les contrôles d'intégrité (mode MongoDB : désactivé
                        par défaut, car un contrôle par fiche est très coûteux)
  --no-verify           Désactive la vérification implicite (mode fichier)
  --help                Affiche cette aide

Variables d'environnement :
  NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE
  NEO4J_ENV_FILE (chemin d'un fichier .env alternatif)
  MONGODB_CONNECTION_STRING, MONGO_URL, MONGODB_DATABASE

Le fichier api/.env est chargé automatiquement s'il existe.
`);
}

function defaultFile() {
  return path.resolve(__dirname, '../../../neo4j/487.json');
}

function applyNeo4jOverrides(config, args) {
  if (args.uri) {
    config.uri = args.uri;
  }
  if (args.user) {
    config.user = args.user;
  }
  if (args.password) {
    config.password = args.password;
  }
  if (args.database) {
    config.database = args.database;
  }
}

function parsePositiveInt(value, fallback) {
  if (value === undefined || value === null || value === true) {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function defaultMongoUrl() {
  try {
    // Même source de configuration que l'API (variables d'environnement,
    // relayées par api/config/index.js).
    const config = require('../config');
    if (config && config.mongooseDB) {
      return config.mongooseDB;
    }
  } catch (error) {
    // La configuration de l'API est optionnelle pour l'import.
  }
  return null;
}

function resolveMongoUrl(args) {
  const url = args['mongo-url']
    || process.env.MONGODB_CONNECTION_STRING
    || process.env.MONGO_URL
    || defaultMongoUrl();
  if (!url) {
    throw new Error(
      'URL MongoDB manquante : definir MONGODB_CONNECTION_STRING (ou MONGO_URL), '
      + 'ou passer --mongo-url <url>.'
    );
  }
  return url;
}

function databaseFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '') || 'studium';
  } catch (error) {
    return 'studium';
  }
}

function sanitizeUrl(url) {
  return String(url).replace(/\/\/([^/@]+)@/, '//***@');
}

function connectMongo(url) {
  const { MongoClient } = require('mongodb');
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (error, client) => {
      if (error) {
        reject(error);
      } else {
        resolve(client);
      }
    });
  });
}

function mongoCount(collection, query) {
  return new Promise((resolve, reject) => {
    collection.count(query || {}, (error, total) => {
      if (error) {
        reject(error);
      } else {
        resolve(total);
      }
    });
  });
}

function mongoFindBatch(collection, skip, limit) {
  return new Promise((resolve, reject) => {
    collection
      .find({})
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray((error, documents) => {
        if (error) {
          reject(error);
        } else {
          resolve(documents);
        }
      });
  });
}

function mongoDuplicateReferences(collection) {
  return new Promise((resolve, reject) => {
    collection.aggregate([
      { $match: { reference: { $exists: true, $ne: null } } },
      { $group: { _id: '$reference', total: { $sum: 1 } } },
      { $match: { total: { $gt: 1 } } },
      { $sort: { total: -1, _id: 1 } },
    ], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

function mongoCountWithoutReference(collection) {
  return mongoCount(collection, {
    $or: [
      { reference: { $exists: false } },
      { reference: null },
      { reference: '' },
    ],
  });
}

function emptyAggregate() {
  return {
    fiches: 0,
    names: 0,
    factoids: 0,
    works: 0,
    rejected_works: 0,
    sources: 0,
    bibliography_links: 0,
    witnesses: 0,
    editions: 0,
    incipits: 0,
  };
}

function addSummary(aggregate, summary) {
  Object.keys(aggregate).forEach(key => {
    if (key !== 'fiches' && summary[key] !== undefined) {
      aggregate[key] += summary[key];
    }
  });
  aggregate.fiches += 1;
  return aggregate;
}

async function runMongoDryRun(options) {
  const aggregate = emptyAggregate();
  let scanned = 0;
  let skipped = 0;
  const failures = [];
  let failureCount = 0;
  const startedAt = Date.now();

  while (true) {
    const remaining = options.limit > 0
      ? Math.min(options.batchSize, options.limit - scanned)
      : options.batchSize;
    if (remaining <= 0) {
      break;
    }

    const documents = await mongoFindBatch(options.collection, options.skip + scanned, remaining);
    if (!documents.length) {
      break;
    }

    documents.forEach(document => {
      if (options.limit > 0 && scanned >= options.limit) {
        return;
      }
      scanned += 1;
      const reference = document.reference;
      if (reference === undefined || reference === null || String(reference).trim() === '') {
        skipped += 1;
        return;
      }
      try {
        addSummary(aggregate, summarizeGraph(buildGraph(document)));
      } catch (error) {
        failureCount += 1;
        if (failures.length < 50) {
          failures.push({
            reference: String(reference),
            mongo_id: String(document._id),
            message: error.message,
          });
        }
      }
    });
  }

  return {
    source: 'mongodb',
    dry_run: true,
    mongo: options.report,
    scanned: scanned,
    skipped_without_reference: skipped,
    graph: aggregate,
    failures: { count: failureCount, sample: failures },
    duration_seconds: Math.round((Date.now() - startedAt) / 1000),
  };
}

async function runMongoImport(args, config) {
  const url = resolveMongoUrl(args);
  const database = args['mongo-db']
    || process.env.MONGODB_DATABASE
    || databaseFromUrl(url);
  const collectionName = args.collection || 'prosopography';
  const skip = parsePositiveInt(args.skip, 0);
  const limit = parsePositiveInt(args.limit, 0);
  const batchSize = Math.max(1, parsePositiveInt(args['batch-size'], 100));
  const dryRun = args['dry-run'] === true;
  const verify = args.verify === true && args['no-verify'] !== true;

  const client = await connectMongo(url);
  try {
    const collection = client.db(database).collection(collectionName);
    const total = await mongoCount(collection);
    const withoutReference = await mongoCountWithoutReference(collection);
    const duplicates = await mongoDuplicateReferences(collection);

    if (withoutReference > 0) {
      console.error(
        `[mongo] ${withoutReference} fiche(s) sans reference seront ignorées.`
      );
    }
    if (duplicates.length > 0) {
      const sample = duplicates
        .slice(0, 10)
        .map(row => `${row._id} (${row.total})`)
        .join(', ');
      console.error(
        `[mongo] ${duplicates.length} référence(s) en doublon : ${sample}`
      );
    }

    const report = {
      url: sanitizeUrl(url),
      database: database,
      collection: collectionName,
      total_documents: total,
      without_reference: withoutReference,
      duplicate_references: duplicates.length,
    };

    const options = {
      collection: collection,
      report: report,
      skip: skip,
      limit: limit,
      batchSize: batchSize,
    };

    if (dryRun) {
      const result = await runMongoDryRun(options);
      console.log(JSON.stringify(result, null, 2));
      if (result.failures.count > 0) {
        process.exitCode = 1;
      }
      return;
    }

    const driver = createDriver(config);
    try {
      await driver.verifyConnectivity();

      let imported = 0;
      let skipped = 0;
      let scanned = 0;
      let verified = 0;
      let verificationFailed = 0;
      let failureCount = 0;
      const failures = [];
      const verificationFailures = [];
      const startedAt = Date.now();

      while (true) {
        const remaining = limit > 0
          ? Math.min(batchSize, limit - scanned)
          : batchSize;
        if (remaining <= 0) {
          break;
        }

        const documents = await mongoFindBatch(collection, skip + scanned, remaining);
        if (!documents.length) {
          break;
        }

        for (let i = 0; i < documents.length; i += 1) {
          const document = documents[i];
          if (limit > 0 && scanned >= limit) {
            break;
          }
          scanned += 1;

          const reference = document.reference;
          if (reference === undefined || reference === null || String(reference).trim() === '') {
            skipped += 1;
            continue;
          }

          try {
            const result = await syncProsopography(driver, config.database, document, {
              replaceFactoids: true,
            });
            imported += 1;

            if (verify) {
              const verification = await verifyImport(
                driver,
                config.database,
                String(reference),
                result.summary
              );
              if (verification.ok) {
                verified += 1;
              } else {
                verificationFailed += 1;
                if (verificationFailures.length < 50) {
                  verificationFailures.push({
                    reference: String(reference),
                    mongo_id: String(document._id),
                    failed_checks: Object.keys(verification.checks).filter(
                      key => verification.checks[key] !== true
                    ),
                  });
                }
              }
            }
          } catch (error) {
            failureCount += 1;
            if (failures.length < 50) {
              failures.push({
                reference: String(reference),
                mongo_id: String(document._id),
                message: error.message,
              });
            }
          }

          if (scanned % 500 === 0) {
            console.error(
              `[mongo] ${scanned} fiche(s) traitée(s) : ${imported} importée(s), `
              + `${skipped} ignorée(s), ${failureCount} échec(s)`
            );
          }
        }
      }

      const result = {
        source: 'mongodb',
        mongo: report,
        neo4j: {
          uri: config.uri,
          database: config.database,
        },
        scanned: scanned,
        imported: imported,
        skipped_without_reference: skipped,
        failures: { count: failureCount, sample: failures },
        verification: verify
          ? { ok: verified, failed: verificationFailed, sample: verificationFailures }
          : null,
        duration_seconds: Math.round((Date.now() - startedAt) / 1000),
      };

      console.log(JSON.stringify(result, null, 2));

      if (failureCount > 0) {
        process.exitCode = 1;
      } else if (verificationFailed > 0) {
        process.exitCode = 2;
      }
    } finally {
      await driver.close();
    }
  } finally {
    await client.close();
  }
}

async function runFileImport(args, config) {
  const file = args.file ? path.resolve(process.cwd(), args.file) : args._[0]
    ? path.resolve(process.cwd(), args._[0])
    : defaultFile();

  if (!fs.existsSync(file)) {
    throw new Error(`Fichier introuvable: ${file}`);
  }

  const prosopography = readJsonFile(file);

  if (args['dry-run']) {
    const graph = buildGraph(prosopography);
    console.log(JSON.stringify({
      file: file,
      dry_run: true,
      summary: summarizeGraph(graph),
    }, null, 2));
    return;
  }

  const driver = createDriver(config);
  try {
    await driver.verifyConnectivity();
    const result = await syncProsopography(driver, config.database, prosopography, {
      replaceFactoids: true,
    });

    let verification = null;
    if (args.verify !== false && args['no-verify'] !== true) {
      verification = await verifyImport(
        driver,
        config.database,
        prosopography.reference,
        result.summary
      );
    }

    console.log(JSON.stringify({
      file: file,
      neo4j: {
        uri: config.uri,
        database: config.database,
      },
      summary: result.summary,
      written: result.written,
      verification: verification,
    }, null, 2));

    if (verification && !verification.ok) {
      process.exitCode = 2;
    }
  } finally {
    await driver.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args['env-file']) {
    loadEnvFile(path.resolve(process.cwd(), args['env-file']));
  }

  const config = getConfig();
  applyNeo4jOverrides(config, args);

  if (args.mongo) {
    await runMongoImport(args, config);
    return;
  }

  await runFileImport(args, config);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
