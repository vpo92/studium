// @flow
/**
 * Contexte de construction du graphe d'une fiche prosopographique.
 *
 * Le modèle reste volontairement plat :
 * - les dates sont des propriétés sur les noeuds ;
 * - les rôles et certitudes sont des propriétés de relations ;
 * - les sources sont dédoublonnées par `norm_key`.
 */

const { cleanText, normKey, sourceNormKey, dedupeBy } = require('./normalize');

const INFORMATION_FIELDS = new Set([
  'value',
  'meta',
  'comment',
  'reference',
  'opus',
  'versions',
  'mainTitle',
]);

function asArray(value) {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Itère sur les entrées d'une section (`origin`, `curriculum`, ...).
 * Chaque entrée est un objet `{ value, meta, comment, reference }`.
 */
function forEachInformationEntry(section, callback) {
  if (!section || typeof section !== 'object') {
    return;
  }

  Object.keys(section).forEach(key => {
    if (INFORMATION_FIELDS.has(key)) {
      return;
    }
    asArray(section[key]).forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }
      if (entry.value === undefined && entry.meta === undefined && entry.reference === undefined) {
        return;
      }
      callback(entry, key, index);
    });
  });
}

/**
 * Récupère les références d'une entrée sous forme de chaînes nettoyées.
 */
function getReferences(entry) {
  return asArray(entry && entry.reference)
    .map(reference => cleanText(reference))
    .filter(Boolean);
}

/**
 * Parcourt récursivement un objet JSON et collecte toutes les références.
 */
function collectReferences(value, accumulator) {
  const result = accumulator || [];
  if (!value || typeof value !== 'object') {
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectReferences(item, result));
    return result;
  }
  Object.keys(value).forEach(key => {
    const child = value[key];
    if (key === 'reference') {
      asArray(child).forEach(reference => {
        const clean = cleanText(reference);
        if (clean) {
          result.push(clean);
        }
      });
    } else {
      collectReferences(child, result);
    }
  });
  return result;
}

/**
 * Concatène les commentaires et notes textuelles d'une entrée.
 */
function getNotes(entry) {
  const notes = asArray(entry && entry.comment)
    .map(comment => cleanText(comment))
    .filter(Boolean);
  return notes.length ? notes.join(' ') : null;
}

/**
 * Humanise une clé de section (`universityFunction` -> `University function`).
 */
function humanizeKey(key) {
  return String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, letter => letter.toUpperCase());
}

class GraphModel {
  constructor(prosopography) {
    this.prosopography = prosopography || {};
    const mongoId = this.prosopography._id || this.prosopography.reference || 'unknown';
    this.mongoId = String(mongoId);
    this.reference = String(this.prosopography.reference || '');
    this.personKey = `person:${this.mongoId}`;

    this.sources = new Map();
    this.names = [];
    this.factoids = [];
    this.works = [];
    this.bibliography = [];
    this.roles = new Map();
    this.selfNameKeys = new Set();
  }

  /**
   * Crée (ou complète) un :Document source.
   */
  addSource(reference, category, extra) {
    const display = cleanText(reference);
    const key = sourceNormKey(reference);
    if (!display || !key) {
      return null;
    }

    let source = this.sources.get(key);
    if (!source) {
      source = {
        norm_key: `source:${key}`,
        doc_id: `source:${key}`,
        source_id: `source:${key}`,
        name: display,
        reference: display,
        doc_type: 'SOURCE',
        categories: [],
        variants: [],
      };
      this.sources.set(key, source);
    }

    // On conserve la forme la plus courte comme libellé principal
    // (`WEIJERS: 1, 56-58` plutôt que `WEIJERS: 1 (1994), 56-58.`).
    if (display.length < source.name.length) {
      source.name = display;
      source.reference = display;
    }
    if (source.variants.indexOf(display) < 0) {
      source.variants.push(display);
    }
    if (category && source.categories.indexOf(category) < 0) {
      source.categories.push(category);
    }
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(prop => {
        if (source[prop] === undefined) {
          source[prop] = extra[prop];
        }
      });
    }
    return source;
  }

  addReferences(entry, category) {
    return dedupeBy(
      getReferences(entry)
        .map(reference => this.addSource(reference, category))
        .filter(Boolean),
      source => source.norm_key
    );
  }

  registerSelfNames(names) {
    names.forEach(name => {
      if (name) {
        const key = normKey(name);
        if (key) {
          this.selfNameKeys.add(key);
        }
      }
    });
  }

  addRole(roleKey, roleLabel) {
    const key = `role:${normKey(roleKey || roleLabel)}`;
    if (!this.roles.has(key)) {
      this.roles.set(key, {
        norm_key: key,
        role_id: key,
        role_description: roleLabel || humanizeKey(roleKey),
      });
    }
    return this.roles.get(key);
  }

  toJSON() {
    return {
      mongo_id: this.mongoId,
      reference: this.reference,
      person_key: this.personKey,
      person: this.person || null,
      names: dedupeBy(this.names, name => name.norm_key),
      sources: Array.from(this.sources.values()),
      factoids: dedupeBy(this.factoids, factoid => factoid.norm_key),
      works: dedupeBy(this.works, work => work.norm_key),
      bibliography: dedupeBy(
        this.bibliography,
        item => `${item.norm_key}|${item.category}`
      ),
      roles: Array.from(this.roles.values()),
    };
  }
}

module.exports = {
  GraphModel,
  asArray,
  forEachInformationEntry,
  getReferences,
  collectReferences,
  getNotes,
  humanizeKey,
};
