// Validation de l'ingestion de la fiche 50875 (Aegidius Romanus)
// Exécution : cypher-shell -u neo4j -p <password> -f neo4j/validate-50875.cypher

// 1. Personne, dates de vie et volume d'événements
MATCH (p:PhysicalPerson {reference: '50875'})
OPTIONAL MATCH (p)-[:HAS_FACTOID]->(f:Factoid)
RETURN p.name AS personne,
       p.mongo_id AS mongo_id,
       p.life_start AS naissance,
       p.life_end AS deces,
       p.activity_start AS debut_activite,
       p.activity_end AS fin_activite,
       count(DISTINCT f) AS factoids;

// 2. Répartition des factoids par section
MATCH (p:PhysicalPerson {reference: '50875'})-[:HAS_FACTOID]->(f:Factoid)
RETURN f.category AS section, count(f) AS factoids
ORDER BY section;

// 3. Relations sociales, voyages et commissions
MATCH (p:PhysicalPerson {reference: '50875'})-[:HAS_FACTOID]->(f:Factoid)
WHERE f.category IN ['relationalInsertion', 'travels', 'commissions']
RETURN f.category AS section, f.role_label AS role, count(f) AS factoids
ORDER BY section, role;

// 4. Oeuvres produites, dont attributions rejetées
MATCH (p:PhysicalPerson {reference: '50875'})-[r:PRODUCED]->(w:Document {doc_type: 'WORK'})
RETURN count(DISTINCT w) AS oeuvres,
       sum(CASE WHEN r.attribution = 'rejected' THEN 1 ELSE 0 END) AS oeuvres_rejetees;

// 5. Témoins, éditions et incipits
MATCH (p:PhysicalPerson {reference: '50875'})-[:PRODUCED]->(w:Document {doc_type: 'WORK'})
OPTIONAL MATCH (w)-[:HAS_WITNESS]->(e:Exemplaire)
WITH p, count(DISTINCT e) AS temoins
OPTIONAL MATCH (p)-[:PRODUCED]->(w2:Document {doc_type: 'WORK'})-[:HAS_EDITION]->(ed:Edition)
WITH p, temoins, count(DISTINCT ed) AS editions
OPTIONAL MATCH (p)-[:PRODUCED]->(w3:Document {doc_type: 'WORK'})-[:HAS_INCIPIT]->(i:Incipit)
RETURN temoins, editions, count(DISTINCT i) AS incipits;

// 6. Lieux de la fiche : un seul noeud par clé
MATCH (p:PhysicalPerson {reference: '50875'})-[:HAS_FACTOID]->(:Factoid)-[:AT_PLACE]->(pl:Place)
RETURN pl.place_description AS lieu, count(DISTINCT pl) AS noeuds, count(*) AS usages
ORDER BY usages DESC;

// 7. Contrôle global des doublons
MATCH (pl:Place)
WITH pl.norm_key AS norm_key, count(*) AS total
WHERE total > 1
RETURN 'lieu' AS type, norm_key, total
UNION ALL
MATCH (d:Document)
WITH d.norm_key AS norm_key, count(*) AS total
WHERE total > 1
RETURN 'document' AS type, norm_key, total;

// 8. Le modèle allégé ne doit pas contenir ces noeuds intermédiaires
MATCH (n)
WHERE n:TimeInterval OR n:Participate OR n:Named
RETURN count(n) AS noeuds_intermediaires_interdits;
