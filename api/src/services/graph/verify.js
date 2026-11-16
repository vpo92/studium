// @flow
/**
 * Contrôles de validation après ingestion.
 *
 * Les volumes attendus sont déduits de la fiche importée (`summary` produit par
 * `buildGraph`) : les contrôles sont donc valables pour toutes les fiches, et
 * pas seulement pour la fiche de référence 487. Ils vérifient que la base
 * contient exactement le graphe construit, sans doublon de lieu ou de source et
 * sans noeud intermédiaire du modèle DAPHNE.
 */

function toNumber(value) {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return value;
}

function recordsToObjects(result) {
  return result.records.map(record => {
    const object = {};
    record.keys.forEach(key => {
      object[key] = toNumber(record.get(key));
    });
    return object;
  });
}

function countValue(rows, key) {
  const row = rows.length ? rows[0] : null;
  if (!row || row[key] === undefined || row[key] === null) {
    return 0;
  }
  return toNumber(row[key]);
}

async function verifyImport(driver, database, reference, expected) {
  const session = driver.session({ database: database });
  const ref = String(reference);
  const run = async (query, params) => {
    const result = await session.run(query, params || {});
    return recordsToObjects(result);
  };

  try {
    const personRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})
       OPTIONAL MATCH (p)-[:HAS_FACTOID]->(f:Factoid)
       RETURN p.name AS name, p.mongo_id AS mongo_id,
              p.life_start AS life_start, p.life_end AS life_end,
              p.activity_start AS activity_start, p.activity_end AS activity_end,
              count(DISTINCT f) AS factoids`,
      { reference: ref }
    );

    const nameRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})
       OPTIONAL MATCH (p)-[:MAIN_NAME|NAMED]->(n:Name)
       RETURN count(DISTINCT n) AS names`,
      { reference: ref }
    );

    const workRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[r:PRODUCED]->(w:Document {doc_type: 'WORK'})
       RETURN count(DISTINCT w) AS works,
              sum(CASE WHEN r.attribution = 'rejected' THEN 1 ELSE 0 END) AS rejected_works`,
      { reference: ref }
    );

    const witnessRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[:PRODUCED]->(w:Document {doc_type: 'WORK'})
       OPTIONAL MATCH (w)-[:HAS_WITNESS]->(e:Exemplaire)
       RETURN count(DISTINCT e) AS witnesses`,
      { reference: ref }
    );

    const editionRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[:PRODUCED]->(w:Document {doc_type: 'WORK'})
       OPTIONAL MATCH (w)-[:HAS_EDITION]->(e:Edition)
       RETURN count(DISTINCT e) AS editions`,
      { reference: ref }
    );

    const incipitRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[:PRODUCED]->(w:Document {doc_type: 'WORK'})
       OPTIONAL MATCH (w)-[:HAS_INCIPIT]->(i:Incipit)
       RETURN count(DISTINCT i) AS incipits`,
      { reference: ref }
    );

    const sourceRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[:HAS_FACTOID]->(:Factoid)-[:REFERS_TO]->(d:Document)
       RETURN count(DISTINCT d) AS factoid_sources`,
      { reference: ref }
    );

    const bibliographyRows = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[r:HAS_BIBLIOGRAPHY]->(:Document)
       RETURN count(r) AS bibliography`,
      { reference: ref }
    );

    const duplicatePlaces = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[:HAS_FACTOID]->(:Factoid)-[:AT_PLACE]->(pl:Place)
       WITH pl.norm_key AS norm_key, count(DISTINCT pl) AS nodes
       WHERE nodes > 1
       RETURN norm_key, nodes`,
      { reference: ref }
    );

    const duplicateSources = await run(
      `MATCH (p:PhysicalPerson {reference: $reference})-[:HAS_FACTOID]->(:Factoid)-[:REFERS_TO]->(d:Document)
       WITH d.norm_key AS norm_key, count(DISTINCT d) AS nodes
       WHERE nodes > 1
       RETURN norm_key, nodes`,
      { reference: ref }
    );

    const forbiddenNodes = await run(
      `MATCH (n)
       WHERE n:TimeInterval OR n:Participate OR n:Named
       RETURN count(n) AS total`
    );

    const person = personRows.length ? personRows[0] : null;
    const actual = {
      names: countValue(nameRows, 'names'),
      factoids: person ? person.factoids : 0,
      works: countValue(workRows, 'works'),
      rejected_works: countValue(workRows, 'rejected_works') || 0,
      witnesses: countValue(witnessRows, 'witnesses'),
      editions: countValue(editionRows, 'editions'),
      incipits: countValue(incipitRows, 'incipits'),
      factoid_sources: countValue(sourceRows, 'factoid_sources'),
      bibliography: countValue(bibliographyRows, 'bibliography'),
    };

    // Sans résumé attendu, seuls les contrôles structurels sont exécutés.
    const hasExpected = expected !== undefined && expected !== null;
    const expectedCounts = hasExpected
      ? {
        names: expected.names,
        factoids: expected.factoids,
        works: expected.works,
        rejected_works: expected.rejected_works,
        witnesses: expected.witnesses,
        editions: expected.editions,
        incipits: expected.incipits,
        bibliography: expected.bibliography_links,
      }
      : null;
    const matches = key =>
      hasExpected ? actual[key] === expectedCounts[key] : true;

    const checks = {
      person_exists: Boolean(person),
      factoids: matches('factoids'),
      names: matches('names'),
      works: matches('works'),
      rejected_works: matches('rejected_works'),
      witnesses: matches('witnesses'),
      editions: matches('editions'),
      incipits: matches('incipits'),
      bibliography: matches('bibliography'),
      no_duplicate_places: duplicatePlaces.length === 0,
      no_duplicate_sources: duplicateSources.length === 0,
      no_light_model_violation: countValue(forbiddenNodes, 'total') === 0,
    };

    return {
      reference: ref,
      person: person,
      actual: actual,
      expected: expectedCounts,
      duplicates: {
        places: duplicatePlaces,
        sources: duplicateSources,
      },
      checks: checks,
      ok: Object.keys(checks).every(key => checks[key] === true),
    };
  } finally {
    await session.close();
  }
}

module.exports = {
  verifyImport,
};
