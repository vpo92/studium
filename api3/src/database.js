const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'studium.db');

let db = null;
function getDB() {
  if (!db) { db = new Database(DB_PATH); db.pragma('journal_mode = WAL'); }
  return db;
}

function buildProsopography(row) {
  if (!row) return null;
  const fields = getDB().prepare(
    'SELECT tag, value FROM person_fields WHERE person_id = ? ORDER BY line_number'
  ).all(row.id);

  const r = { reference: row.reference };
  const identity = {}, origin = {}, relation = {}, curriculum = {};
  const eccCareer = {}, profCareer = [], polCareer = [], travels = [];
  const commissions = [], assets = [], orality = [], other = [], library = [];
  let works = [], currentWork = null, worksSection = null;

  const push = () => { if (currentWork && Object.keys(currentWork).length) { works.push(currentWork); currentWork = {}; } };

  for (const f of fields) {
    const { tag: t, value: v } = f;
    if (t === '1b') identity.name = { value: v };
    else if (t === '1c') {
      if (!identity.nameVariant) identity.nameVariant = [];
      v.split(',').map(s => s.trim().replace(/\$/g, '')).filter(Boolean).forEach(s =>
        identity.nameVariant.push({ value: s })
      );
    }
    else if (t === '1d') identity.description = { value: v.replace(/^[:.\s]+/, '') };
    else if (t === '1e') identity.datesOfLife = parseRange(v);
    else if (t === '1f') identity.datesOfActivity = parseRange(v);
    else if (t === '1g') identity.activityMediane = { value: v.replace(/%/g, '') };
    else if (t === '1h') identity.gender = { value: /femme|fem/i.test(v) ? 'female' : 'male' };
    else if (t === '1k') identity.status = { value: mapStatus(v) };
    else if (t === '2a') origin.birthPlace = { value: clean(v) };
    else if (t === '2b') origin.diosese = { value: clean(v) };
    else if (t === '2c') { if (!origin.movesInOutParis) origin.movesInOutParis = []; origin.movesInOutParis.push({ value: clean(v) }); }
    else if (t === '3a' && !relation.socialClassOrigin) relation.socialClassOrigin = { value: v };
    else if (t === '3b') {
      if (!relation.familyNetwork) relation.familyNetwork = [];
      relation.familyNetwork.push({ name: { value: clean(v) } });
    }
    else if (t === '3d') { if (!relation.personalServicesRelationship) relation.personalServicesRelationship = []; relation.personalServicesRelationship.push({ value: clean(v) }); }
    else if (t === '3e') { if (!relation.friends) relation.friends = []; relation.friends.push({ value: clean(v) }); }
    else if (t === '3f') { if (!relation.controversyOrDebates) relation.controversyOrDebates = []; relation.controversyOrDebates.push({ value: clean(v) }); }
    else if (t === '3l') { if (!relation.studentProfessorRelationships) relation.studentProfessorRelationships = []; relation.studentProfessorRelationships.push({ value: clean(v) }); }
    else if (t === '5a') { if (!curriculum.preUniversity) curriculum.preUniversity = []; curriculum.preUniversity.push({ value: clean(v) }); }
    else if (t === '5b') { if (!curriculum.university) curriculum.university = []; curriculum.university.push({ value: clean(v) }); }
    else if (t === '5c') { if (!curriculum.grades) curriculum.grades = []; curriculum.grades.push({ value: clean(v) }); }
    else if (t === '5e') { if (!curriculum.universityCollege) curriculum.universityCollege = []; curriculum.universityCollege.push({ value: clean(v) }); }
    else if (t === '5f') { if (!curriculum.collegeFundations) curriculum.collegeFundations = []; curriculum.collegeFundations.push({ value: clean(v) }); }
    else if (t.match(/^6[abceijk]/)) {
      if (!eccCareer.secularPosition) eccCareer.secularPosition = [];
      eccCareer.secularPosition.push({ value: clean(v) });
    }
    else if (t === '6d' || t === '6e') { if (!eccCareer.regularOrder) eccCareer.regularOrder = []; eccCareer.regularOrder.push({ value: clean(v) }); }
    else if (t === '6f') { if (!eccCareer.regularFunctions) eccCareer.regularFunctions = []; eccCareer.regularFunctions.push({ value: clean(v) }); }
    else if (t === '6i') { if (!eccCareer.popFunctions) eccCareer.popFunctions = []; eccCareer.popFunctions.push({ value: clean(v) }); }
    else if (t.match(/^7/)) profCareer.push({ value: { value: clean(v) }, type: mapProfType(t) });
    else if (t.match(/^8/)) polCareer.push({ value: { value: clean(v) }, type: 'importantPosition' });
    else if (t === '9') travels.push({ value: clean(v) });
    else if (t === '10a' || t === '10b') commissions.push({ value: { value: clean(v) }, type: t === '10a' ? 'university' : 'other' });
    else if (t.match(/^12/)) assets.push({ value: { value: clean(v) }, type: { '12a': 'incomes', '12b': 'parisHousing', '12c': 'otherHousing' }[t] || 'other' });
    else if (t === '16a') orality.push({ value: clean(v) });
    else if (t === '17a') { if (!curriculum.collegeFundations) curriculum.collegeFundations = []; curriculum.collegeFundations.push({ value: clean(v) }); }
    else if (t.match(/^18\./)) library.push({ title: { value: clean(v) } });
    else if (t.match(/^20[ab]?\d*/)) { if (t === '20') { push(); worksSection = 'religious'; } else { push(); currentWork = { title: { value: clean(v) } }; } }
    else if (t.match(/^21[ab]?\d*/)) { if (t === '21') { push(); worksSection = 'philosophical'; } else { push(); currentWork = { title: { value: clean(v) } }; } }
    else if (t.match(/^22[ab]?\d*/)) { if (t === '22') { push(); worksSection = 'literary'; } else { push(); currentWork = { title: { value: clean(v) } }; } }
    else if (t.match(/^23[ab]?\d*/)) { if (t === '23') { push(); worksSection = 'scientific'; } else { push(); currentWork = { title: { value: clean(v) } }; } }
    else if (t.match(/^<<.+>>$/)) {
      if (currentWork) {
        const k = t.replace(/[<>]/g, '');
        if (k === 'b') currentWork.date = { value: clean(v) };
        else if (k === 'l') currentWork.language = { value: clean(v) };
        else if (k === 'c') { if (!currentWork.manuscript) currentWork.manuscript = []; currentWork.manuscript.push({ shelfmark: { value: clean(v) } }); }
        else if (k === 'cc') { if (!currentWork.incipit) currentWork.incipit = []; currentWork.incipit.push({ value: clean(v) }); }
        else if (k === 'd') { if (!currentWork.editionBefore1700) currentWork.editionBefore1700 = []; currentWork.editionBefore1700.push({ date: { value: clean(v) } }); }
        else if (k === 'i') currentWork.editing = { value: clean(v) };
        else if (k === 'ti') currentWork.title = { value: clean(v) };
      }
    }
    else if (t === '19') other.push({ value: v });
  }
  push();

  if (Object.keys(identity).length) r.identity = identity;
  if (Object.keys(origin).length) r.origin = origin;
  if (Object.keys(relation).length) r.relationalInsertion = relation;
  if (Object.keys(curriculum).length) r.curriculum = curriculum;
  if (Object.keys(eccCareer).length) r.ecclesiasticalCareer = eccCareer;
  if (profCareer.length) r.professionalCareer = profCareer;
  if (polCareer.length) r.politicalCareer = polCareer;
  if (travels.length) r.travels = travels;
  if (commissions.length) r.commissions = commissions;
  if (assets.length) r.assets = assets;
  if (orality.length) r.orality = orality;
  if (other.length) r.otherActivities = other;
  if (library.length) r.library = library;
  if (works.length) r.textualProduction = { opus: works };
  return r;
}

function parseRange(v) {
  const m = v.match(/%?\s*(\d{3,4})\s*-\s*(\d{3,4})?\s*%?/);
  if (m) return m[2] ? { from: m[1], to: m[2] } : { from: m[1] };
  const m2 = v.match(/%?\s*-\s*(\d{3,4})%?/);
  if (m2) return { to: m2[1] };
  return { value: v.replace(/%/g, '').trim() };
}

function clean(v) {
  return v.replace(/\$/g, '').replace(/%[^%]*%/g, m => m.replace(/%/g, '')).replace(/\*([^*]+)\*/g, '$1').replace(/£([^£]+)£/g, '$1').replace(/&([^&]+)&/g, '$1').replace(/\s+/g, ' ').trim();
}

function mapStatus(v) {
  const l = v.toLowerCase();
  if (l.includes('maître') || l.includes('maitre')) return 'master';
  if (l.includes('gradué') || l.includes('bachelier') || l.includes('licencié') || l.includes('docteur')) return 'graduate';
  if (l.includes('étudiant') || l.includes('etudiant')) return 'student';
  if (l.includes('extérieur') || l.includes('exterieur')) return 'external';
  if (l.includes('suppôt') || l.includes('suppot')) return 'suppot';
  if (l.includes('incertain')) return 'unconfirmed';
  return 'other';
}

function mapProfType(tag) {
  return { '7a': 'universityFunction', '7b': 'universityFunction', '7c': 'universityFunction', '7d': 'royalAdministration', '7e': 'royalAdministration', '7j': 'lawFunction', '7l': 'localAdministrationFunction', '7m': 'medicine', '7n': 'medicine' }[tag] || 'other';
}

function findAll(pagination = {}) {
  const page = pagination.page || 1;
  const rows = pagination.rows || 20;
  const offset = (page - 1) * rows;
  const total = getDB().prepare('SELECT COUNT(*) as c FROM persons').get().c;
  const list = rows < 0
    ? getDB().prepare('SELECT * FROM persons ORDER BY reference').all()
    : getDB().prepare('SELECT * FROM persons ORDER BY reference LIMIT ? OFFSET ?').all(rows, offset);
  return { data: list.map(r => buildProsopography(r)), total };
}

function findByReference(ref) {
  return buildProsopography(getDB().prepare('SELECT * FROM persons WHERE reference = ?').get(ref));
}

function textSearch(searchText, pagination = {}) {
  const page = pagination.page || 1;
  const rows = pagination.rows || 20;
  const offset = (page - 1) * rows;
  const q = `%${searchText}%`;
  const total = getDB().prepare('SELECT COUNT(DISTINCT p.id) as c FROM persons p JOIN person_fields f ON f.person_id = p.id WHERE f.value LIKE ?').get(q).c;
  const list = getDB().prepare(`SELECT DISTINCT p.* FROM persons p JOIN person_fields f ON f.person_id = p.id WHERE f.value LIKE ? ORDER BY p.reference LIMIT ? OFFSET ?`).all(q, rows, offset);
  return { data: list.map(r => buildProsopography(r)), total };
}

function indexSearch(letter) {
  return getDB().prepare("SELECT * FROM persons WHERE name LIKE ? ORDER BY reference").all(`${letter}%`).map(r => buildProsopography(r));
}

function getAllIds() {
  return getDB().prepare('SELECT reference, name FROM persons ORDER BY reference').all();
}

module.exports = { getDB, findAll, findByReference, textSearch, indexSearch, getAllIds };
