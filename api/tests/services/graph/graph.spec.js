const fs = require('fs');
const path = require('path');

const {
  buildGraph,
  summarizeGraph,
  prepareGraph,
} = require('../../../src/services/graph');
const {
  cleanText,
  normKey,
  sourceNormKey,
  parseManuscript,
} = require('../../../src/services/graph/normalize');

const FIXTURE = path.resolve(__dirname, '../../../../neo4j/487.json');
const FIXTURE_50875 = path.resolve(__dirname, '../../../../neo4j/50875.json');

function loadFixture(file) {
  return JSON.parse(fs.readFileSync(file || FIXTURE, 'utf8'));
}

describe('normalisation FJPG', () => {
  it('supprime les balises et les ponctuations finales', () => {
    expect(cleanText('\t$Alexander de VILLA=DEI$ ;')).toBe('Alexander de VILLA DEI');
    expect(cleanText('*Paris vers %1180-1225%.')).toBe('Paris vers 1180-1225');
    expect(cleanText('&Doctrinale&')).toBe('Doctrinale');
  });

  it('calcule une clé canonique stable', () => {
    expect(normKey('Città del Vaticano')).toBe('citta del vaticano');
    expect(normKey('WEIJERS: 1, 56-58.')).toBe('weijers 1 56 58');
    expect(sourceNormKey('WEIJERS: 1 (1994), 56-58.')).toBe(
      sourceNormKey('WEIJERS: 1, 56-58.')
    );
  });

  it('extrait un témoin manuscrit', () => {
    const witness = parseManuscript('MS. Paris, BnF lat. 14927, f. 164-175 ;');
    expect(witness.reference).toBe('MS. Paris, BnF lat. 14927, f. 164-175');
    expect(witness.archivingLocation).toBe('Paris');
    expect(witness.sheet).toBe('f. 164-175');
  });
});

describe('construction du graphe de la fiche 487', () => {
  let graph;

  beforeAll(() => {
    graph = buildGraph(loadFixture());
  });

  it('produit la personne et ses noms', () => {
    expect(graph.person.name).toBe('ALEXANDER de Villa Dei');
    expect(graph.person.activity_start).toBe(1190);
    expect(graph.person.activity_end).toBe(1240);
    expect(graph.names.filter(name => name.name_type === 'MAIN_NAME')).toHaveLength(1);
    expect(graph.names.filter(name => name.name_type === 'NAMED').length).toBeGreaterThanOrEqual(2);
  });

  it('crée un factoid par étape de vie', () => {
    const summary = summarizeGraph(graph);
    expect(summary.factoids).toBe(8);
    expect(graph.factoids.map(f => f.role_key)).toEqual([
      'birthPlace',
      'diocese',
      'university',
      'grades',
      'grades',
      'secularPosition',
      'professorOrPerceptor',
      'universityFunction',
    ]);
  });

  it('dédoublonne Paris et Avranches', () => {
    const names = graph.factoids.reduce((all, factoid) => {
      return all.concat(factoid.places.map(place => place.norm_key));
    }, []);
    expect(names.filter(key => key === 'place:paris')).toHaveLength(4);
    expect(new Set(names).has('place:paris')).toBe(true);
    expect(new Set(names).has('place:avranches')).toBe(true);
    expect(names.filter(key => key === 'place:avranches')).toHaveLength(1);
  });

  it('dédoublonne la source WEIJERS', () => {
    const weijers = graph.sources.filter(source => /WEIJERS/i.test(source.name));
    expect(weijers).toHaveLength(1);
    expect(weijers[0].name).toBe('WEIJERS: 1, 56-58');
    expect(weijers[0].variants).toContain('WEIJERS: 1 (1994), 56-58');
  });

  it('relie les co-acteurs cités', () => {
    const factoid = graph.factoids.find(f => f.role_key === 'universityFunction');
    const people = factoid.people.map(person => person.name);
    expect(people).toContain('IVO');
    expect(people).toContain('RODOLPHE');
  });

  it('distingue les oeuvres rejetées', () => {
    const rejected = graph.works.filter(work => work.rejected);
    expect(rejected.map(work => work.title)).toEqual([
      'Sermones',
      'Libellus de algorismo',
      'Carmen de musica cum glossis',
    ]);
    expect(graph.works.find(work => work.title === 'Doctrinale').attribution).toBe('certain');
  });

  it('prépare une charge Neo4j sérialisable', () => {
    const payload = prepareGraph(graph);
    expect(payload.person.norm_key).toBe('person:5de691957b945ca77ef11d64');
    expect(payload.factoids).toHaveLength(8);
    expect(payload.works.length).toBe(16);
    expect(payload.sources.length).toBe(29);
    // Les sous-structures ne doivent pas être envoyées comme propriétés Neo4j.
    payload.factoids.forEach(factoid => {
      expect(factoid.props.places).toBeUndefined();
      expect(factoid.props.people).toBeUndefined();
      expect(factoid.props.sources).toBeUndefined();
    });
  });
});

describe('construction du graphe de la fiche 50875', () => {
  let graph;

  beforeAll(() => {
    graph = buildGraph(loadFixture(FIXTURE_50875));
  });

  it('produit la personne, ses noms, ses dates de vie et d’activité', () => {
    expect(graph.person.name).toBe('AEGIDIUS Romanus');
    expect(graph.person.mongo_id).toBe('5ead94b255063b09074990fa');
    expect(graph.person.life_start).toBe(1245);
    expect(graph.person.life_end).toBe(1316);
    expect(graph.person.activity_start).toBe(1265);
    expect(graph.person.activity_end).toBe(1316);
    expect(graph.names.filter(name => name.name_type === 'MAIN_NAME')).toHaveLength(1);
    expect(graph.names.filter(name => name.name_type === 'NAMED')).toHaveLength(3);
  });

  it('ingère toutes les sections de vie, y compris relations, voyages et commissions', () => {
    const summary = summarizeGraph(graph);
    expect(summary.factoids).toBe(37);
    expect(summary.works).toBe(178);
    expect(summary.rejected_works).toBe(19);
    expect(summary.witnesses).toBe(1815);
    expect(summary.editions).toBe(260);
    expect(summary.incipits).toBe(135);

    const byCategory = graph.factoids.reduce((counts, factoid) => {
      counts[factoid.category] = (counts[factoid.category] || 0) + 1;
      return counts;
    }, {});
    expect(byCategory).toEqual({
      origin: 2,
      relationalInsertion: 2,
      curriculum: 5,
      ecclesiasticalCareer: 17,
      professionalCareer: 6,
      travels: 4,
      commissions: 1,
    });
  });

  it('relie les personnes citées et les lieux des voyages', () => {
    const friends = graph.factoids.find(factoid => factoid.role_key === 'friends');
    expect(friends.people.map(person => person.name)).toContain('BONIFACE VIII');

    const students = graph.factoids.find(
      factoid => factoid.role_key === 'studentProfessorRelationships'
    );
    expect(students.people.map(person => person.name)).toContain('Jacobus de VITERBO');

    const travelPlaces = graph.factoids
      .filter(factoid => factoid.category === 'travels')
      .reduce((keys, factoid) => keys.concat(factoid.places.map(place => place.norm_key)), []);
    expect(new Set(travelPlaces).has('place:paris')).toBe(true);
    expect(new Set(travelPlaces).has('place:bayeux')).toBe(true);
  });

  it('prépare une charge Neo4j sérialisable', () => {
    const payload = prepareGraph(graph);
    expect(payload.person.norm_key).toBe('person:5ead94b255063b09074990fa');
    expect(payload.factoids).toHaveLength(37);
    expect(payload.works.length).toBe(178);
    expect(payload.sources.length).toBe(1209);
    expect(payload.factoids.filter(factoid => factoid.category === 'travels')).toHaveLength(4);
  });
});
