'use strict';
//
// studium-cli — point d'entrée minimal embarqué dans l'image API/worker.
//
// Réutilise la fonction existante batchs/src/rawFilesParser/mongoService.js
// #createAdmin (transpilée par babel vers /app/cli/mongoService.js à la
// construction de l'image ; dépendances : crypto + mongodb, déjà présents).
//
// Volontairement, on n'embarque pas batchs/index.js : sa chaîne d'imports
// (restService) tire 'sleep' (module natif), 'request' et chalk@4 (node>=10),
// indisponibles/incompatibles avec le runtime node:8.17.0.
//
// Usage (depuis le serveur, dans le réseau de la stack) :
//   docker compose exec studium_api studium-cli create-admin \
//     --email admin@studium.local [--username "Admin Secours"] \
//     [--password '...' | export STUDIUM_ADMIN_PASSWORD=...] [--url mongodb://...]
//
const MongoClient = require('mongodb').MongoClient;
const createAdmin = require('./mongoService.js').createAdmin;

const VERSION = require('../package.json').version;

function usage() {
  console.log([
    'studium-cli ' + VERSION + ' (barre d\'outils embarquée dans l\'image API)',
    '',
    'Commands:',
    '  create-admin   crée un compte administrateur dans MongoDB (users)',
    '                   --username NOM      nom affiché (défaut : administrator)',
    '                   --email    ADDR     email, obligatoire (stocké en minuscules,',
    '                                       le login de l\'API recherche en lowercase)',
    '                   --password MDP      ou via l\'env STUDIUM_ADMIN_PASSWORD',
    '                   --url      MONGO_URL  ou via l\'env MONGODB_CONNECTION_STRING',
    '  version',
    '  help',
    '',
  ].join('\n'));
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.indexOf('--') === 0) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      } else if (i + 1 < argv.length && argv[i + 1].indexOf('--') !== 0) {
        out[a.slice(2)] = argv[++i];
      } else {
        out[a.slice(2)] = '';
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function fail(msg) {
  console.error('[x] ' + msg);
  process.exit(1);
}

function verifyInserted(url, email) {
  // createAdmin avale ses erreurs (catch -> console.log, exit 0) : on relit
  // le document en base pour connaître le vrai résultat.
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) return reject(err);
      db.collection('users').findOne({ email: email }, function (e2, u) {
        db.close();
        if (e2) return reject(e2);
        resolve(u);
      });
    });
  });
}

function createAdminCmd(args) {
  const email = (args.email || '').trim().toLowerCase();
  const username = args.username || 'administrator';
  const password = args.password || process.env.STUDIUM_ADMIN_PASSWORD || '';
  const url = args.url || process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost/studium';

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('Option --email invalide ou absente.');
  if (!password) fail('Mot de passe requis (--password ou env STUDIUM_ADMIN_PASSWORD).');

  console.log('[+] create-admin ' + email + ' (' + username + ') -> ' + url.replace(/\/\/[^@]*@/, '//***@'));

  return createAdmin(username, email, password, url)
    .then(function () { return verifyInserted(url, email); })
    .then(function (u) {
      if (!u) fail('createAdmin n\'a rien inséré (voir erreur ci-dessus) — compte absent en base.');
      if ((u.role || []).indexOf('admin') === -1) fail('Compte présent mais sans rôle admin : ' + JSON.stringify(u.role));
      console.log('[+] Compte créé : ' + JSON.stringify({ name: u.name, email: u.email, role: u.role }));
      console.log('[+] Connectez-vous via l\'interface, changez le mot de passe, puis supprimez ce compte de secours.');
    });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = (args._[0] || 'help').trim();
  switch (cmd) {
    case 'create-admin':
      createAdminCmd(args).catch(function (e) { fail(e && e.message || String(e)); });
      break;
    case 'version':
      console.log('studium-cli ' + VERSION);
      break;
    case 'help':
      usage();
      break;
    default:
      usage();
      fail('Commande inconnue : ' + cmd);
  }
}

main();
