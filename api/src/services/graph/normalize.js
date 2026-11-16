// @flow
/**
 * Helpers de normalisation des données FJPG/Studium.
 *
 * Le parseur FJPG conserve volontairement certaines balises syntaxiques dans
 * les valeurs (`$`, `£`, `%`, `*`, `&`, tabulations). Le graphe Neo4j ne doit
 * contenir que du texte lisible ; les clés de fusion sont, elles, calculées sur
 * une forme canonique (minuscules, sans accents, sans ponctuation).
 */

const crypto = require('crypto');

const TRAILING_PUNCTUATION = /[\s.;,:]+$/;
const FJPG_TAGS = /[$£%*&]/g;

/**
 * Nettoie une valeur issue du parseur FJPG.
 *
 * - supprime les balises syntaxiques ;
 * - transforme les `=` de collage FJPG en espaces ;
 * - normalise les espaces/tabulations ;
 * - supprime les ponctuations finales (`.`, `;`, `,`, `:`).
 */
function cleanText(value, options) {
  const opts = options || {};
  if (value === null || value === undefined) {
    return '';
  }

  let text = String(value)
    .replace(/\r\n?/g, ' ')
    .replace(/\t/g, ' ')
    .replace(FJPG_TAGS, '')
    .replace(/\u00a0/g, ' ')
    .replace(/=+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Les commentaires FJPG commencent par `/`.
  if (text.charAt(0) === '/') {
    text = text.slice(1).trim();
  }

  if (opts.stripTrailingPunctuation !== false) {
    text = text.replace(TRAILING_PUNCTUATION, '').trim();
  }

  return text;
}

/**
 * Clé de fusion canonique.
 */
function normKey(value) {
  return cleanText(value, { stripTrailingPunctuation: false })
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Clé de fusion d'une référence bibliographique.
 *
 * Les références courtes sont parfois écrites avec l'année entre parenthèses
 * (`WEIJERS: 1 (1994), 56-58.`) et parfois sans (`WEIJERS: 1, 56-58.`). On
 * ignore ces parenthèses contenant une année afin de ne créer qu'un seul
 * :Document source. Les initiales d'auteurs (`GOROCHOV (N.)`) sont conservées.
 */
function sourceNormKey(reference) {
  // Les bases en ligne sont parfois citées avec deux URL différentes ; on
  // retire les URL et les mentions entre crochets pour ne garder que le titre.
  const withoutUrls = String(reference || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ');
  const withoutYears = withoutUrls.replace(
    /\([^)]*(?:\b1[0-9]{3}\b|\b20[0-9]{2}\b)[^)]*\)/g,
    ' '
  );
  return normKey(withoutYears);
}

/**
 * Indique si une valeur est un placeholder du parseur (`?`, `?MS.`, vide...).
 */
function isPlaceholder(value) {
  const text = cleanText(value, { stripTrailingPunctuation: false });
  if (!text) {
    return true;
  }
  return /^\?+$/.test(text) || /^\?*\s*MS\.?$/i.test(text);
}

/**
 * Détermine la certitude d'une information à partir de sa valeur brute.
 *
 * Le `?` de FJPG est le marqueur d'incertitude. Les formulations explicites
 * sont également prises en compte pour les données déjà rédigées.
 */
function certaintyFrom() {
  const values = Array.prototype.slice.call(arguments);
  const text = values
    .filter(value => value !== null && value !== undefined)
    .join(' ')
    .toLowerCase();

  if (!text) {
    return 'certain';
  }
  if (text.indexOf('?') >= 0) {
    return 'uncertain';
  }
  if (/attribution douteuse|douteu|incertain|probable/.test(text)) {
    return 'probable';
  }
  return 'certain';
}

function dateNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return Math.trunc(n);
}

/**
 * Convertit les métadonnées `dates` du parseur en propriétés plates.
 *
 * Le schéma DAPHNE utilise des TimeInterval, mais le modèle retenu porte les
 * dates directement sur les :Factoid / :Document / :Edition. Plusieurs dates
 * sont agrégées dans un intervalle min/max.
 */
function parseDateMeta(meta, displayValue) {
  const dates = meta && Array.isArray(meta.dates) ? meta.dates : [];
  let start = null;
  let end = null;
  let kind = null;

  dates.forEach(date => {
    if (!date || typeof date !== 'object') {
      return;
    }
    if (date.type === 'INTERVAL') {
      const startDate = dateNumber(date.startDate && date.startDate.date);
      const endDate = dateNumber(date.endDate && date.endDate.date);
      if (startDate !== null) {
        start = start === null ? startDate : Math.min(start, startDate);
      }
      if (endDate !== null) {
        end = end === null ? endDate : Math.max(end, endDate);
      }
      kind = kind || 'INTERVAL';
    } else if (date.type === 'SIMPLE' || date.date !== undefined) {
      const dateValue = dateNumber(date.date);
      if (dateValue !== null) {
        start = start === null ? dateValue : Math.min(start, dateValue);
        end = end === null ? dateValue : Math.max(end, dateValue);
      }
      kind = kind || 'SIMPLE';
    }
  });

  if (start === null && end === null) {
    return {
      date_start: null,
      date_end: null,
      date_type: null,
      date_display: cleanText(displayValue) || null,
    };
  }

  return {
    date_start: start,
    date_end: end,
    date_type: kind,
    date_display: cleanText(displayValue) || (start === end ? String(start) : `${start}-${end}`),
  };
}

/**
 * Récupère la date d'une liste `dateAndPlace` en ignorant les entrées qui sont
 * en réalité des commentaires (elles commencent par `/`).
 */
function pickDatesFromDateAndPlace(dateAndPlace) {
  const entries = Array.isArray(dateAndPlace) ? dateAndPlace : [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const isComment = typeof entry.value === 'string' && /^\s*\//.test(entry.value);
    if (!isComment && entry.meta && Array.isArray(entry.meta.dates) && entry.meta.dates.length) {
      return parseDateMeta(entry.meta, entry.value);
    }
  }
  return parseDateMeta(null, null);
}

/**
 * Extraction d'un témoin manuscrit :
 * `MS. Paris, BnF lat. 14927, f. 164-175 ;`
 */
function parseManuscript(value) {
  if (isPlaceholder(value)) {
    return null;
  }

  const original = String(value || '');
  const text = cleanText(original);
  if (!text) {
    return null;
  }

  const afterMs = text.replace(/^\?*\s*MS\.?\s*/i, '');
  const locationMatch = afterMs.match(/^([^,;]+)/);
  let archivingLocation = locationMatch ? locationMatch[1].trim() : null;

  // `Città del Vaticano` est une localisation, pas un nom de bibliothèque.
  if (archivingLocation && /^(?:Città\s+del\s+Vaticano|Vaticano)$/i.test(archivingLocation)) {
    archivingLocation = 'Città del Vaticano';
  }

  const sheetMatch = text.match(/(?:f\.|fol\.|p\.)\s*[^,;]+/i);
  const scribeMatch =
    original.match(/copi[ée]\s+par\s+\$([^$]+)\$/i) ||
    text.match(/copi[ée]\s+par\s+([^,;.]+)/i);

  return {
    reference: text,
    original_text: original.trim(),
    archivingLocation: archivingLocation,
    sheet: sheetMatch ? sheetMatch[0].trim() : null,
    scribeName: scribeMatch ? cleanText(scribeMatch[1]) : null,
    certainty: certaintyFrom(original),
  };
}

/**
 * Extrait les personnes citées entre `$...$` (co-acteurs, dédicataires...).
 * Exemple : `$Jean de la MOUCHE, évêque de Dol$`.
 */
function parsePersonMentions(value, ignoreKeys) {
  if (!value) {
    return [];
  }
  const ignore = ignoreKeys instanceof Set ? ignoreKeys : new Set(ignoreKeys || []);
  const text = String(value);
  const results = [];
  const seen = new Set();
  const regex = /\$([^$]+)\$/g;
  let match = regex.exec(text);

  while (match) {
    const raw = match[1];
    const decoded = cleanText(raw);
    if (decoded) {
      const comma = decoded.indexOf(',');
      const name = (comma >= 0 ? decoded.slice(0, comma) : decoded).trim();
      const description = comma >= 0 ? decoded.slice(comma + 1).trim() : null;
      const key = normKey(name);
      if (key && key.length > 1 && !ignore.has(key) && !seen.has(key)) {
        seen.add(key);
        results.push({
          norm_key: `person:${key}`,
          name: name,
          description: description || null,
          certainty: certaintyFrom(raw),
        });
      }
    }
    match = regex.exec(text);
  }

  return results;
}

/**
 * Extrait des personnes depuis les métadonnées `names` du parseur.
 */
function parseMetaNames(meta, ignoreKeys) {
  if (!meta || !Array.isArray(meta.names)) {
    return [];
  }
  const ignore = ignoreKeys instanceof Set ? ignoreKeys : new Set(ignoreKeys || []);
  return meta.names
    .map(name => {
      const clean = cleanText(name);
      const key = normKey(clean);
      if (!key || key.length < 2 || ignore.has(key)) {
        return null;
      }
      return {
        norm_key: `person:${key}`,
        name: clean,
        description: null,
        certainty: certaintyFrom(name),
      };
    })
    .filter(Boolean);
}

function dedupeBy(items, getKey) {
  const map = new Map();
  items.forEach(item => {
    if (!item) {
      return;
    }
    const key = getKey(item);
    if (key && !map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

function sha1Short(value, length) {
  return crypto
    .createHash('sha1')
    .update(String(value))
    .digest('hex')
    .slice(0, length || 16);
}

function compact(object) {
  const result = {};
  Object.keys(object || {}).forEach(key => {
    const value = object[key];
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  return result;
}

module.exports = {
  cleanText,
  normKey,
  sourceNormKey,
  isPlaceholder,
  certaintyFrom,
  parseDateMeta,
  pickDatesFromDateAndPlace,
  parseManuscript,
  parsePersonMentions,
  parseMetaNames,
  dedupeBy,
  sha1Short,
  compact,
};
