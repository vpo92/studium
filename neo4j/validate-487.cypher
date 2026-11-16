// Validation de l'ingestion de la fiche 487 (Alexander de Villa Dei)
// Exécution : cypher-shell -u neo4j -p <password> -f neo4j/validate-487.cypher

// 1. Personne et volume d'événements
MATCH (p:PhysicalPerson {reference: '487'})
OPTIONAL MATCH (p)-[:HAS_FACTOID]->(f:Factoid)
RETURN p.name AS personne,
       p.mongo_id AS mongo_id,
       count(DISTINCT f) AS factoids;

// 2. Oeuvres produites, dont attributions rejetées
MATCH (p:PhysicalPerson {reference: '487'})-[r:PRODUCED]->(w:Document {doc_type: 'WORK'})
RETURN count(DISTINCT w) AS oeuvres,
       sum(CASE WHEN r.attribution = 'rejected' THEN 1 ELSE 0 END) AS oeuvres_rejetees;

// 3. Témoins, éditions et incipits
MATCH (p:PhysicalPerson {reference: '487'})-[:PRODUCED]->(w:Document {doc_type: 'WORK'})
OPTIONAL MATCH (w)-[:HAS_WITNESS]->(e:Exemplaire)
WITH p, count(DISTINCT e) AS temoins
OPTIONAL MATCH (p)-[:PRODUCED]->(w2:Document {doc_type: 'WORK'})-[:HAS_EDITION]->(ed:Edition)
WITH p, temoins, count(DISTINCT ed) AS editions
OPTIONAL MATCH (p)-[:PRODUCED]->(w3:Document {doc_type: 'WORK'})-[:HAS_INCIPIT]->(i:Incipit)
RETURN temoins, editions, count(DISTINCT i) AS incipits;

// 4. Lieux Paris et Avranches : un seul noeud chacun
MATCH (pl:Place)
WHERE pl.norm_key IN ['place:paris', 'place:avranches']
RETURN pl.place_description AS lieu, count(*) AS noeuds, count(DISTINCT pl.norm_key) AS cles;

// 5. Source WEIJERS : une seule source, quel que soit le nombre d'usages
MATCH (d:Document)
WHERE d.name CONTAINS 'WEIJERS'
OPTIONAL MATCH (d)<-[r:REFERS_TO]-(x)
RETURN d.name AS source, d.norm_key AS norm_key, count(x) AS usages;

// 6. Contrôle global des doublons
MATCH (pl:Place)
WITH pl.norm_key AS norm_key, count(*) AS total
WHERE total > 1
RETURN 'lieu' AS type, norm_key, total
UNION ALL
MATCH (d:Document)
WITH d.norm_key AS norm_key, count(*) AS total
WHERE total > 1
RETURN 'document' AS type, norm_key, total;

// 7. Le modèle allégé ne doit pas contenir ces noeuds intermédiaires
MATCH (n)
WHERE n:TimeInterval OR n:Participate OR n:Named
RETURN count(n) AS noeuds_intermediaires_interdits;
