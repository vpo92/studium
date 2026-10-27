const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DB_PATH = path.join(__dirname, '..', 'data', 'studium.db');
const DATA_PATH = path.join(__dirname, '..', 'full_db.txt');

function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = OFF');
  db.pragma('cache_size = -64000');
  db.pragma('foreign_keys = OFF');

  db.exec(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference INTEGER UNIQUE,
      name TEXT,
      raw_text TEXT
    );
    CREATE TABLE IF NOT EXISTS person_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL REFERENCES persons(id),
      tag TEXT NOT NULL,
      value TEXT,
      line_number INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_fields_person ON person_fields(person_id);
    CREATE INDEX IF NOT EXISTS idx_fields_tag ON person_fields(tag);
    CREATE INDEX IF NOT EXISTS idx_fields_tag_value ON person_fields(tag, value);
    CREATE INDEX IF NOT EXISTS idx_persons_ref ON persons(reference);
    CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(name);
  `);

  return db;
}

async function importData(db) {
  const insertPerson = db.prepare(
    'INSERT OR IGNORE INTO persons (reference, name, raw_text) VALUES (?, ?, ?)'
  );
  const insertField = db.prepare(
    'INSERT INTO person_fields (person_id, tag, value, line_number) VALUES (?, ?, ?, ?)'
  );

  const getPersonId = db.prepare('SELECT id FROM persons WHERE reference = ?');

  const insertMany = db.transaction((records) => {
    for (const rec of records) {
      insertPerson.run(rec.reference, rec.name, rec.rawText);
      const row = getPersonId.get(rec.reference);
      if (row) {
        for (const field of rec.fields) {
          insertField.run(row.id, field.tag, field.value, field.lineNumber);
        }
      }
    }
  });

  const fileStream = fs.createReadStream(DATA_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let current = null;
  let records = [];
  let lineNum = 0;
  let batch = [];
  const BATCH_SIZE = 500;

  const tagPattern = /^<([^>]+)>[ \t]+(.*)$/;
  const contPattern = /^\/(.*)$/;

  for await (const rawLine of rl) {
    lineNum++;
    const line = rawLine.trimEnd();

    if (line.length === 0) {
      if (current) {
        batch.push(current);
        if (batch.length >= BATCH_SIZE) {
          insertMany(batch);
          records.push(...batch);
          batch = [];
        }
        current = null;
      }
      continue;
    }

    const tagMatch = line.match(tagPattern);
    if (tagMatch) {
      const tag = tagMatch[1];
      const value = tagMatch[2].trim();

      if (tag === '1a') {
        if (current) {
          if (batch.length < BATCH_SIZE) batch.push(current);
          else { insertMany(batch); records.push(...batch); batch = [current]; }
        }
        if (batch.length >= BATCH_SIZE) {
          insertMany(batch);
          records.push(...batch);
          batch = [];
        }
        current = {
          reference: parseInt(value),
          name: '',
          rawText: line + '\n',
          fields: []
        };
        continue;
      }

      if (current) {
        if (tag === '1b') current.name = value;
        current.fields.push({ tag, value, lineNumber: lineNum });
        current.rawText += line + '\n';
      }
      continue;
    }

    const contMatch = line.match(contPattern);
    if (contMatch && current) {
      const last = current.fields[current.fields.length - 1];
      if (last && !last.tag.startsWith('1')) {
        last.value += '\n' + contMatch[1].trim();
      }
      current.rawText += line + '\n';
      continue;
    }

    if (current) {
      current.rawText += line + '\n';
      const m = line.match(/^(C)[ \t]+(.*)$/);
      if (m) {
        current.fields.push({ tag: m[1], value: m[2].trim(), lineNumber: lineNum });
      }
    }
  }

  if (current) batch.push(current);
  if (batch.length > 0) { insertMany(batch); records.push(...batch); }

  console.log(`Imported ${records.length} records (${lineNum} lines)`);
  return records;
}

async function main() {
  console.log('Initializing database...');
  const db = initDB();
  console.log('Importing data from full_db.txt...');
  const start = Date.now();
  await importData(db);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done in ${elapsed}s`);
  db.close();
}

main().catch(err => { console.error('Import failed:', err); process.exit(1); });
