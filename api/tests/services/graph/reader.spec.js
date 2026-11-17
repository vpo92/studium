const {
  findGraphByReference,
  normalizeDepth,
  entityId,
} = require('../../../src/services/graph/reader');

function neo4jInteger(value) {
  return {
    low: value,
    high: 0,
    toNumber: () => value,
    toString: () => String(value),
  };
}

function fakeNode(id, labels, properties) {
  return {
    identity: neo4jInteger(id),
    labels: labels,
    properties: properties || {},
  };
}

function fakeRelationship(id, type, start, end, properties) {
  return {
    identity: neo4jInteger(id),
    type: type,
    start: neo4jInteger(start),
    end: neo4jInteger(end),
    properties: properties || {},
  };
}

function fakeRecord(values) {
  return {
    get: key => values[key],
  };
}

function fakeDriver(records) {
  const session = {
    run: jest.fn().mockResolvedValue({ records: records }),
    close: jest.fn().mockResolvedValue(undefined),
  };
  return {
    session: jest.fn(() => session),
    sessionMock: session,
  };
}

describe('lecture du graphe Neo4j', () => {
  const person = fakeNode(1, ['PhysicalPerson'], {
    norm_key: 'person:5de691957b945ca77ef11d64',
    reference: '487',
    name: 'ALEXANDER de Villa Dei',
    life_start: neo4jInteger(1190),
  });
  const name = fakeNode(2, ['Name'], {
    norm_key: 'name:5de691957b945ca77ef11d64:main:alexander de villa dei',
    completeName: 'ALEXANDER de Villa Dei',
  });
  const mainName = fakeRelationship(10, 'MAIN_NAME', 1, 2, {
    certainty: 'certain',
  });

  it('convertit les noeuds et relations en structure classique', async () => {
    const driver = fakeDriver([
      fakeRecord({
        person: person,
        path_nodes: [[person, name]],
        path_relationships: [[mainName]],
      }),
    ]);

    const graph = await findGraphByReference('487', {
      driver: driver,
      database: 'neo4j',
    });

    expect(graph.reference).toBe('487');
    expect(graph.nodes).toEqual([
      {
        id: '1',
        labels: ['PhysicalPerson'],
        properties: {
          norm_key: 'person:5de691957b945ca77ef11d64',
          reference: '487',
          name: 'ALEXANDER de Villa Dei',
          life_start: 1190,
        },
      },
      {
        id: '2',
        labels: ['Name'],
        properties: {
          norm_key: 'name:5de691957b945ca77ef11d64:main:alexander de villa dei',
          completeName: 'ALEXANDER de Villa Dei',
        },
      },
    ]);
    expect(graph.links).toEqual([
      {
        id: '10',
        type: 'MAIN_NAME',
        source: '1',
        target: '2',
        properties: { certainty: 'certain' },
      },
    ]);
  });

  it('dédoublonne les noeuds et relations répétés', async () => {
    const driver = fakeDriver([
      fakeRecord({
        person: person,
        path_nodes: [[person, name], [person, name]],
        path_relationships: [[mainName], [mainName]],
      }),
    ]);

    const graph = await findGraphByReference('487', { driver: driver });

    expect(graph.nodes).toHaveLength(2);
    expect(graph.links).toHaveLength(1);
  });

  it('retourne null quand la personne est absente', async () => {
    const driver = fakeDriver([]);

    const graph = await findGraphByReference('404', { driver: driver });

    expect(graph).toBeNull();
    expect(driver.sessionMock.close).toHaveBeenCalled();
  });

  it('utilise une profondeur de 1 par défaut', async () => {
    const driver = fakeDriver([]);

    await findGraphByReference('487', { driver: driver });

    expect(driver.sessionMock.run).toHaveBeenCalledWith(
      expect.stringContaining('[*1..1]'),
      { reference: '487' }
    );
  });

  it('borne la profondeur pour éviter une traversée non maîtrisée', () => {
    expect(normalizeDepth(undefined)).toBe(1);
    expect(normalizeDepth(0)).toBe(0);
    expect(normalizeDepth('2')).toBe(2);
    expect(normalizeDepth(-3)).toBe(1);
    expect(normalizeDepth(999)).toBe(5);
  });

  it('utilise elementId lorsque le driver le fournit', () => {
    expect(entityId({ elementId: '4:abc:12', identity: neo4jInteger(12) })).toBe('4:abc:12');
    expect(entityId({ identity: neo4jInteger(12) })).toBe('12');
  });
});
