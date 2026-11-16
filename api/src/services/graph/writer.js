// @flow
/**
 * Projection du modèle en base Neo4j.
 *
 * Toutes les fusions se font sur `norm_key` (ou `mongo_id` pour la personne).
 * Les :Factoid de la fiche sont supprimés puis recréés à chaque synchronisation
 * afin de refléter les mises à jour sans accumuler d'anciens événements.
 */

const { compact } = require('./normalize');

const SCHEMA_CONSTRAINTS = [
  'CREATE CONSTRAINT physical_person_norm_key IF NOT EXISTS FOR (n:PhysicalPerson) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT name_norm_key IF NOT EXISTS FOR (n:Name) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT place_norm_key IF NOT EXISTS FOR (n:Place) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT zone_norm_key IF NOT EXISTS FOR (n:Zone) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT moral_entity_norm_key IF NOT EXISTS FOR (n:MoralEntity) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT person_norm_key IF NOT EXISTS FOR (n:Person) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT document_norm_key IF NOT EXISTS FOR (n:Document) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT exemplaire_norm_key IF NOT EXISTS FOR (n:Exemplaire) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT edition_norm_key IF NOT EXISTS FOR (n:Edition) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT incipit_norm_key IF NOT EXISTS FOR (n:Incipit) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT factoid_norm_key IF NOT EXISTS FOR (n:Factoid) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT role_norm_key IF NOT EXISTS FOR (n:Role) REQUIRE n.norm_key IS UNIQUE',
  'CREATE CONSTRAINT factoid_type_norm_key IF NOT EXISTS FOR (n:FactoidType) REQUIRE n.norm_key IS UNIQUE',
];

const CLEAR_FACTOIDS = `
MATCH (p:PhysicalPerson {norm_key: $person_key})-[:HAS_FACTOID]->(f:Factoid)
DETACH DELETE f
`;

const UPSERT_PERSON = `
MERGE (p:PhysicalPerson {norm_key: $person.norm_key})
SET p += $person.props
SET p.updated_at = datetime()
WITH p
UNWIND $person.source_keys AS source_key
MATCH (source:Document {norm_key: source_key})
MERGE (p)-[:SOURCED_BY]->(source)
`;

const UPSERT_SOURCES = `
UNWIND $sources AS source
MERGE (doc:Document {norm_key: source.norm_key})
ON CREATE SET doc.created_at = datetime()
SET doc += source.props
SET doc.updated_at = datetime()
`;

const UPSERT_NAMES = `
UNWIND $names AS name
MERGE (node:Name {norm_key: name.norm_key})
ON CREATE SET node.created_at = datetime()
SET node += name.props
SET node.updated_at = datetime()
`;

const LINK_MAIN_NAMES = `
UNWIND $names AS name
WITH name WHERE name.name_type = 'MAIN_NAME'
MATCH (p:PhysicalPerson {norm_key: $person_key})
MATCH (node:Name {norm_key: name.norm_key})
MERGE (p)-[r:MAIN_NAME]->(node)
SET r.certainty = name.certainty
`;

const LINK_NAME_VARIANTS = `
UNWIND $names AS name
WITH name WHERE name.name_type <> 'MAIN_NAME'
MATCH (p:PhysicalPerson {norm_key: $person_key})
MATCH (node:Name {norm_key: name.norm_key})
MERGE (p)-[r:NAMED]->(node)
SET r.certainty = name.certainty
`;

const LINK_NAME_SOURCES = `
UNWIND $names AS name
MATCH (node:Name {norm_key: name.norm_key})
UNWIND name.source_keys AS source_key
MATCH (source:Document {norm_key: source_key})
MERGE (node)-[:SOURCED_BY]->(source)
`;

const UPSERT_ROLES = `
UNWIND $roles AS role
MERGE (node:Role {norm_key: role.norm_key})
SET node += role.props
`;

const UPSERT_FACTOIDS = `
UNWIND $factoids AS factoid
MERGE (node:Factoid {norm_key: factoid.norm_key})
ON CREATE SET node.created_at = datetime()
SET node += factoid.props
SET node.updated_at = datetime()
WITH node, factoid
MATCH (p:PhysicalPerson {norm_key: $person_key})
MERGE (p)-[r:HAS_FACTOID]->(node)
SET r.role = factoid.role_key,
    r.role_label = factoid.role_label,
    r.category = factoid.category,
    r.certainty = factoid.certainty,
    r.date_start = factoid.date_start,
    r.date_end = factoid.date_end
`;

const LINK_FACTOID_PLACES = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
UNWIND factoid.places AS place
MERGE (target:Place {norm_key: place.norm_key})
SET target += place.props
MERGE (node)-[r:AT_PLACE {role: place.role}]->(target)
SET r.certainty = place.certainty
`;

const LINK_FACTOID_ZONES = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
UNWIND factoid.zones AS zone
MERGE (target:Zone {norm_key: zone.norm_key})
SET target += zone.props
MERGE (node)-[r:IN_ZONE {role: zone.role}]->(target)
SET r.certainty = zone.certainty
`;

const LINK_FACTOID_INSTITUTIONS = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
UNWIND factoid.institutions AS institution
MERGE (target:MoralEntity {norm_key: institution.norm_key})
SET target += institution.props
MERGE (node)-[r:HAS_ROLE_IN {role: institution.role}]->(target)
SET r.certainty = institution.certainty
`;

const LINK_FACTOID_PEOPLE = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
UNWIND factoid.people AS person
MERGE (target:Person {norm_key: person.norm_key})
SET target += person.props
MERGE (node)-[r:CITES {role: 'coActor'}]->(target)
SET r.certainty = person.certainty
`;

const LINK_FACTOID_SOURCES = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
UNWIND factoid.sources AS source
MATCH (target:Document {norm_key: source.norm_key})
MERGE (node)-[r:REFERS_TO {role: source.role}]->(target)
SET r.certainty = source.certainty
`;

const LINK_FACTOID_ROLES = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
MATCH (role:Role {norm_key: factoid.role_norm_key})
MERGE (node)-[:HAS_ROLE]->(role)
`;

const LINK_FACTOID_TYPES = `
UNWIND $factoids AS factoid
MATCH (node:Factoid {norm_key: factoid.norm_key})
MERGE (type:FactoidType {norm_key: 'factoid_type:' + factoid.category})
SET type.factoid_type_id = 'factoid_type:' + factoid.category,
    type.description = factoid.category
MERGE (node)-[:IS_TYPE_OF]->(type)
`;

const UPSERT_WORKS = `
UNWIND $works AS work
MERGE (doc:Document {norm_key: work.norm_key})
ON CREATE SET doc.created_at = datetime()
SET doc += work.props
SET doc.updated_at = datetime()
WITH doc, work
MATCH (p:PhysicalPerson {norm_key: $person_key})
MERGE (p)-[r:PRODUCED]->(doc)
SET r.attribution = work.attribution,
    r.certainty = work.certainty,
    r.section = work.section,
    r.role = 'textualProduction'
`;

const LINK_WORK_VERSIONS = `
UNWIND $works AS work
WITH work WHERE work.parent_key IS NOT NULL
MATCH (child:Document {norm_key: work.norm_key})
MATCH (parent:Document {norm_key: work.parent_key})
MERGE (parent)-[:HAS_VERSION]->(child)
`;

const LINK_WORK_SOURCES = `
UNWIND $works AS work
MATCH (doc:Document {norm_key: work.norm_key})
UNWIND work.sources AS source
MATCH (target:Document {norm_key: source.norm_key})
MERGE (doc)-[r:REFERS_TO {role: source.role}]->(target)
SET r.certainty = source.certainty
`;

const LINK_WORK_PEOPLE = `
UNWIND $works AS work
MATCH (doc:Document {norm_key: work.norm_key})
UNWIND work.people AS person
MERGE (target:Person {norm_key: person.norm_key})
SET target += person.props
MERGE (doc)-[r:MENTIONS {role: 'mentioned'}]->(target)
SET r.certainty = person.certainty,
    r.description = person.description
`;

const UPSERT_WITNESSES = `
UNWIND $works AS work
MATCH (doc:Document {norm_key: work.norm_key})
UNWIND work.witnesses AS witness
MERGE (node:Exemplaire {norm_key: witness.norm_key})
SET node += witness.props
MERGE (doc)-[r:HAS_WITNESS]->(node)
SET r.certainty = witness.certainty
`;

const UPSERT_EDITIONS = `
UNWIND $works AS work
MATCH (doc:Document {norm_key: work.norm_key})
UNWIND work.editions AS edition
MERGE (node:Edition {norm_key: edition.norm_key})
SET node += edition.props
MERGE (doc)-[r:HAS_EDITION {edition_type: edition.edition_type}]->(node)
`;

const LINK_EDITION_PLACES = `
UNWIND $works AS work
UNWIND work.editions AS edition
MATCH (node:Edition {norm_key: edition.norm_key})
UNWIND edition.places AS place
MERGE (target:Place {norm_key: place.norm_key})
SET target += place.props
MERGE (node)-[:PUBLISHED_AT]->(target)
`;

const UPSERT_INCIPITS = `
UNWIND $works AS work
MATCH (doc:Document {norm_key: work.norm_key})
UNWIND work.incipits AS incipit
MERGE (node:Incipit {norm_key: incipit.norm_key})
SET node += incipit.props
MERGE (doc)-[r:HAS_INCIPIT {kind: incipit.kind}]->(node)
`;

const LINK_BIBLIOGRAPHY = `
UNWIND $bibliography AS item
MATCH (p:PhysicalPerson {norm_key: $person_key})
MATCH (source:Document {norm_key: item.norm_key})
MERGE (p)-[r:HAS_BIBLIOGRAPHY {category: item.category}]->(source)
`;

function without(object, keys) {
  const result = {};
  Object.keys(object || {}).forEach(key => {
    if (keys.indexOf(key) < 0) {
      result[key] = object[key];
    }
  });
  return result;
}

function prepareGraph(graph) {
  const personProps = compact(
    without(graph.person, ['norm_key', 'source_keys'])
  );

  const sources = graph.sources.map(source => ({
    norm_key: source.norm_key,
    props: compact(without(source, ['norm_key'])),
  }));

  const names = graph.names.map(name => ({
    norm_key: name.norm_key,
    name_type: name.name_type,
    certainty: name.certainty,
    source_keys: name.source_keys || [],
    props: compact(without(name, ['norm_key', 'source_keys'])),
  }));

  const roles = graph.roles.map(role => ({
    norm_key: role.norm_key,
    props: compact(without(role, ['norm_key'])),
  }));

  const factoids = graph.factoids.map(factoid => ({
    norm_key: factoid.norm_key,
    category: factoid.category,
    role_key: factoid.role_key,
    role_label: factoid.role_label,
    role_norm_key: factoid.role_norm_key,
    certainty: factoid.certainty,
    date_start: factoid.date_start,
    date_end: factoid.date_end,
    props: compact(
      without(factoid, [
        'norm_key',
        'person_key',
        'places',
        'zones',
        'institutions',
        'people',
        'sources',
        'role_norm_key',
      ])
    ),
    places: (factoid.places || []).map(place => ({
      norm_key: place.norm_key,
      role: place.role,
      certainty: place.certainty,
      props: compact(without(place, ['norm_key', 'role', 'certainty'])),
    })),
    zones: (factoid.zones || []).map(zone => ({
      norm_key: zone.norm_key,
      role: zone.role,
      certainty: zone.certainty,
      props: compact(without(zone, ['norm_key', 'role', 'certainty'])),
    })),
    institutions: (factoid.institutions || []).map(institution => ({
      norm_key: institution.norm_key,
      role: institution.role,
      certainty: institution.certainty,
      props: compact(without(institution, ['norm_key', 'role', 'certainty'])),
    })),
    people: (factoid.people || []).map(person => ({
      norm_key: person.norm_key,
      certainty: person.certainty,
      description: person.description,
      props: compact({
        person_id: person.norm_key,
        name: person.name,
        shortdesc: person.description,
      }),
    })),
    sources: factoid.sources || [],
  }));

  const works = graph.works.map(work => ({
    norm_key: work.norm_key,
    parent_key: work.parent_key,
    attribution: work.attribution,
    certainty: work.certainty,
    section: work.section,
    props: compact(
      without(work, [
        'norm_key',
        'parent_key',
        'sources',
        'people',
        'witnesses',
        'editions',
        'incipits',
      ])
    ),
    sources: work.sources || [],
    people: (work.people || []).map(person => ({
      norm_key: person.norm_key,
      certainty: person.certainty,
      description: person.description,
      props: compact({
        person_id: person.norm_key,
        name: person.name,
        shortdesc: person.description,
      }),
    })),
    witnesses: (work.witnesses || []).map(witness => ({
      norm_key: witness.norm_key,
      certainty: witness.certainty,
      props: compact(without(witness, ['norm_key', 'certainty'])),
    })),
    editions: (work.editions || []).map(edition => ({
      norm_key: edition.norm_key,
      edition_type: edition.edition_type,
      places: (edition.places || []).map(place => ({
        norm_key: place.norm_key,
        props: compact(without(place, ['norm_key'])),
      })),
      props: compact(without(edition, ['norm_key', 'places'])),
    })),
    incipits: (work.incipits || []).map(incipit => ({
      norm_key: incipit.norm_key,
      kind: incipit.kind,
      props: compact(without(incipit, ['norm_key'])),
    })),
  }));

  return {
    person: { norm_key: graph.person.norm_key, props: personProps, source_keys: graph.person.source_keys || [] },
    sources: sources,
    names: names,
    roles: roles,
    factoids: factoids,
    works: works,
    bibliography: graph.bibliography,
  };
}

/**
 * Écrit un graphe complet dans Neo4j. Retourne le résumé des volumes écrits.
 */
async function writeGraph(driver, database, graph, options) {
  const opts = options || {};
  const payload = prepareGraph(graph);
  const session = driver.session({ database: database });

  try {
    // Neo4j interdit de mélanger modification de schéma et écritures dans une
    // même transaction : les contraintes sont créées en amont (auto-commit).
    for (let i = 0; i < SCHEMA_CONSTRAINTS.length; i += 1) {
      await session.run(SCHEMA_CONSTRAINTS[i]);
    }

    const runTransaction = session.executeWrite
      ? session.executeWrite.bind(session)
      : session.writeTransaction.bind(session);

    await runTransaction(async tx => {
      if (opts.replaceFactoids !== false) {
        await tx.run(CLEAR_FACTOIDS, { person_key: graph.person_key });
      }

      await tx.run(UPSERT_SOURCES, { sources: payload.sources });
      await tx.run(UPSERT_PERSON, { person: payload.person });
      await tx.run(UPSERT_NAMES, { names: payload.names });
      await tx.run(LINK_MAIN_NAMES, {
        names: payload.names,
        person_key: graph.person_key,
      });
      await tx.run(LINK_NAME_VARIANTS, {
        names: payload.names,
        person_key: graph.person_key,
      });
      await tx.run(LINK_NAME_SOURCES, { names: payload.names });
      await tx.run(UPSERT_ROLES, { roles: payload.roles });

      await tx.run(UPSERT_FACTOIDS, {
        factoids: payload.factoids,
        person_key: graph.person_key,
      });
      await tx.run(LINK_FACTOID_PLACES, { factoids: payload.factoids });
      await tx.run(LINK_FACTOID_ZONES, { factoids: payload.factoids });
      await tx.run(LINK_FACTOID_INSTITUTIONS, { factoids: payload.factoids });
      await tx.run(LINK_FACTOID_PEOPLE, { factoids: payload.factoids });
      await tx.run(LINK_FACTOID_SOURCES, { factoids: payload.factoids });
      await tx.run(LINK_FACTOID_ROLES, { factoids: payload.factoids });
      await tx.run(LINK_FACTOID_TYPES, { factoids: payload.factoids });

      await tx.run(UPSERT_WORKS, {
        works: payload.works,
        person_key: graph.person_key,
      });
      await tx.run(LINK_WORK_VERSIONS, { works: payload.works });
      await tx.run(LINK_WORK_SOURCES, { works: payload.works });
      await tx.run(LINK_WORK_PEOPLE, { works: payload.works });
      await tx.run(UPSERT_WITNESSES, { works: payload.works });
      await tx.run(UPSERT_EDITIONS, { works: payload.works });
      await tx.run(LINK_EDITION_PLACES, { works: payload.works });
      await tx.run(UPSERT_INCIPITS, { works: payload.works });

      await tx.run(LINK_BIBLIOGRAPHY, {
        bibliography: payload.bibliography,
        person_key: graph.person_key,
      });
    });
  } finally {
    await session.close();
  }

  return {
    sources: payload.sources.length,
    names: payload.names.length,
    factoids: payload.factoids.length,
    works: payload.works.length,
    witnesses: payload.works.reduce((total, work) => total + work.witnesses.length, 0),
    editions: payload.works.reduce((total, work) => total + work.editions.length, 0),
    incipits: payload.works.reduce((total, work) => total + work.incipits.length, 0),
    bibliography: payload.bibliography.length,
  };
}

module.exports = {
  SCHEMA_CONSTRAINTS,
  prepareGraph,
  writeGraph,
};
