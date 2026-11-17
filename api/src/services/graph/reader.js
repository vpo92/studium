// @flow
/**
 * Lecture d'un graphe de prosopographie depuis Neo4j.
 *
 * Le graphe est renvoyé sous une forme « classique » directement exploitable
 * par une librairie de visualisation :
 * - `nodes` : `{ id, labels, properties }` ;
 * - `links` : `{ id, type, source, target, properties }`.
 *
 * La traversée part d'une `PhysicalPerson` identifiée par sa référence et
 * s'étend par défaut sur une profondeur de 1 (voisins directs, dans les deux
 * sens).
 */

const { getConfig, createDriver } = require('./config');

const DEFAULT_DEPTH = 1;
const MAX_DEPTH = 5;

let sharedDriver = null;
let sharedConfig = null;

function getConnection() {
  if (!sharedConfig) {
    sharedConfig = getConfig();
  }
  if (!sharedDriver) {
    sharedDriver = createDriver(sharedConfig);
  }
  return sharedDriver;
}

/**
 * Ferme le driver partagé (utile pour les tests ou un arrêt propre).
 */
async function closeDriver() {
  const driver = sharedDriver;
  sharedDriver = null;
  sharedConfig = null;
  if (driver) {
    await driver.close();
  }
}

/**
 * Identifiant stable d'un noeud ou d'une relation.
 * `elementId` existe à partir de Neo4j 5 ; `identity` est utilisé avant.
 */
function entityId(entity) {
  if (entity.elementId !== undefined && entity.elementId !== null) {
    return String(entity.elementId);
  }
  return String(entity.identity);
}

function isNeo4jInteger(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.toNumber === 'function' &&
    value.low !== undefined &&
    value.high !== undefined
  );
}

/**
 * Convertit les types Neo4j (Integer, DateTime, ...) en valeurs JSON.
 */
function toJsonValue(value) {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (isNeo4jInteger(value)) {
    const number = value.toNumber();
    return Number.isSafeInteger(number) ? number : value.toString();
  }

  const prototype = Object.getPrototypeOf(value);
  if (
    prototype !== null &&
    prototype !== Object.prototype &&
    typeof value.toString === 'function'
  ) {
    // Types temporels et spatiaux Neo4j : la forme ISO/texte est la plus utile.
    return value.toString();
  }

  const result = {};
  Object.keys(value).forEach(key => {
    result[key] = toJsonValue(value[key]);
  });
  return result;
}

function nodeToJson(node) {
  return {
    id: entityId(node),
    labels: Array.isArray(node.labels) ? node.labels.slice() : [],
    properties: toJsonValue(node.properties || {}),
  };
}

function relationshipToJson(relationship) {
  const start =
    relationship.startNodeElementId !== undefined && relationship.startNodeElementId !== null
      ? String(relationship.startNodeElementId)
      : String(relationship.start);
  const end =
    relationship.endNodeElementId !== undefined && relationship.endNodeElementId !== null
      ? String(relationship.endNodeElementId)
      : String(relationship.end);
  return {
    id: entityId(relationship),
    type: relationship.type,
    source: start,
    target: end,
    properties: toJsonValue(relationship.properties || {}),
  };
}

function normalizeDepth(depth) {
  if (depth === undefined || depth === null || depth === '') {
    return DEFAULT_DEPTH;
  }
  const parsed = parseInt(depth, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_DEPTH;
  }
  return Math.min(parsed, MAX_DEPTH);
}

function buildQuery(depth) {
  if (depth === 0) {
    return `
      MATCH (p:PhysicalPerson {reference: $reference})
      WITH p ORDER BY p.mongo_id LIMIT 1
      RETURN p AS person, [] AS path_nodes, [] AS path_relationships
    `;
  }
  // La borne est un entier contrôlé : elle peut être interpolée sans risque.
  return `
    MATCH (p:PhysicalPerson {reference: $reference})
    WITH p ORDER BY p.mongo_id LIMIT 1
    OPTIONAL MATCH path = (p)-[*1..${depth}]-(n)
    RETURN p AS person,
           collect(nodes(path)) AS path_nodes,
           collect(relationships(path)) AS path_relationships
  `;
}

function buildGraph(records, reference) {
  if (!records.length) {
    return null;
  }

  const nodes = new Map();
  const links = new Map();

  const addNode = node => {
    if (!node) {
      return;
    }
    const id = entityId(node);
    if (!nodes.has(id)) {
      nodes.set(id, nodeToJson(node));
    }
  };

  const addRelationship = relationship => {
    if (!relationship) {
      return;
    }
    const id = entityId(relationship);
    if (!links.has(id)) {
      links.set(id, relationshipToJson(relationship));
    }
  };

  records.forEach(record => {
    addNode(record.get('person'));

    const pathNodes = record.get('path_nodes') || [];
    pathNodes.forEach(list => {
      (list || []).forEach(addNode);
    });

    const pathRelationships = record.get('path_relationships') || [];
    pathRelationships.forEach(list => {
      (list || []).forEach(addRelationship);
    });
  });

  return {
    reference: reference,
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
  };
}

/**
 * Récupère le graphe d'une `PhysicalPerson` à partir de sa référence.
 *
 * @param {string} reference Référence de la fiche (`487`, `50875`, ...).
 * @param {object} [options] `driver`, `database` et `depth` (défaut 1).
 * @returns {Promise<object|null>} Le graphe, ou `null` si la personne n'existe pas.
 */
async function findGraphByReference(reference, options) {
  const opts = options || {};
  const depth = normalizeDepth(opts.depth);
  const driver = opts.driver || getConnection();
  const database = opts.database || (sharedConfig && sharedConfig.database) || getConfig().database;
  const session = driver.session({ database: database });

  try {
    const result = await session.run(buildQuery(depth), { reference: String(reference) });
    return buildGraph(result.records, String(reference));
  } finally {
    await session.close();
  }
}

module.exports = {
  DEFAULT_DEPTH,
  MAX_DEPTH,
  findGraphByReference,
  getConnection,
  closeDriver,
  toJsonValue,
  entityId,
  normalizeDepth,
};
