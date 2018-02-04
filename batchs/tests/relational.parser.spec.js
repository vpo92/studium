import relationalParser from '../src/relational.parser';

describe('relational.parser', function() {
  describe('relational.parser.parseFamilyNetwork', function() {
    it('should return null if no value at all', function(done) {
      expect(relationalParser.parseFamilyNetwork(null)).toBe(null);
      expect(relationalParser.parseFamilyNetwork('')).toBe(null);
      done();
    });

    it('should return null if wrong value', function(done) {
      expect(relationalParser.parseFamilyNetwork({})).toEqual(null);
      expect(relationalParser.parseFamilyNetwork([])).toBe(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      let ex1 = [
        {
          data: {
            pname: {
              last_name: 'ASSER S',
              qualif: 'kjalmsen Rig',
              content: 'ASSER Skjalmsen Rig',
            },
            content: ['Son père est', ';'],
          },
          type: 'père',
        },
      ];

      let exp = [
        {
          name: { value: 'ASSER Skjalmsen Rig' },
          type: 'father',
        },
      ];

      expect(relationalParser.parseFamilyNetwork(ex1)).toEqual(exp);

      let ex2 = [
        {
          data: {
            pname: {
              last_name: 'ASSER S',
              qualif: 'kjalmsen Rig',
              content: 'ASSER Skjalmsen Rig',
            },
            content: ['Son père est', ';'],
          },
          type: 'père',
        },
        {
          data: {
            pname: {
              last_name: 'ERIK',
              ptitle: {
                text_before: 'jarl',
                text_after: '',
                see: ' ERIK=',
                empty_word: 'de',
                content: 'Falster',
              },
              qualif: 'de=Västergötland  jarl de',
              content: 'ERIK de Västergötland,  jarl de',
            },
            dates: {
              date: {
                certitude: true,
                type: 'single',
                content: 1145,
              },
            },
            content: ['Son grand-père maternel est', ', \u2020', ';'],
          },
          type: 'père grand-père',
        },
      ];

      let exp2 = [
        {
          name: { value: 'ASSER Skjalmsen Rig' },
          type: 'father',
        },
        {
          name: { value: 'ERIK de Västergötland,  jarl de Falster' },
          type: 'grandfather',
        },
      ];

      let res2 = relationalParser.parseFamilyNetwork(ex2);
      expect(res2).toEqual(exp2);

      let ex3 = [
        {
          data: 'Louis',
          type: 'frère',
        },
      ];

      let exp3 = [
        {
          name: { value: 'Louis' },
          type: 'brother',
        },
      ];
      expect(relationalParser.parseFamilyNetwork(ex3)).toEqual(exp3);

      let ex4 = [
        {
          data: {
            pname: [
              {
                last_name: 'CECILIA K',
                qualif: 'nudsdater',
                content: 'CECILIA Knudsdater',
              },
              {
                last_name: 'KNUD',
                first_name: 'saint',
                qualif: '',
                content: 'saint KNUD',
              },
            ],
            content: ['Sa grand-mère maternelle est', ', fille de', ';'],
          },
          type: 'mère fille',
        },
      ];

      let exp4 = [
        {
          name: { value: 'CECILIA Knudsdater, saint KNUD' },
          type: 'grandmother',
        },
      ];
      let res4 = relationalParser.parseFamilyNetwork(ex4);
      expect(res4).toEqual(exp4);

      let ex5 = [
        {
          data: {
            pname: {
              last_name: 'ASSER S',
              qualif: 'kjalmsen Rig',
              content: 'ASSER Skjalmsen Rig',
            },
            content: ['Son père est', ';'],
          },
          type: 'grand frere de la soeur du fils',
        },
      ];

      let exp5 = [
        {
          name: { value: 'ASSER Skjalmsen Rig' },
          type: 'other',
        },
      ];
      expect(relationalParser.parseFamilyNetwork(ex5)).toEqual(exp5);

      //extract from 8.json.xml
      let ex6 = [
        {
          data: {
            pname: {
              last_name: 'ASSER S',
              qualif: 'kjalmsen Rig',
              content: 'ASSER Skjalmsen Rig',
            },
            content: ['Son père est', ';'],
          },
          type: 'père',
        },
        {
          data: {
            pname: {
              last_name: 'INGER E',
              qualif: 'riksdater',
              content: 'INGER Eriksdater',
            },
            content: ['Sa mère est', ';'],
          },
          type: 'mère',
        },
        {
          data: {
            pname: {
              last_name: 'ERIK',
              ptitle: {
                text_before: 'jarl',
                text_after: '',
                see: ' ERIK=',
                empty_word: 'de',
                content: 'Falster',
              },
              qualif: 'de=Västergötland  jarl de',
              content: 'ERIK de Västergötland,  jarl de',
            },
            dates: {
              date: {
                certitude: true,
                type: 'single',
                content: 1145,
              },
            },
            content: ['Son grand-père maternel est', ', \u2020', ';'],
          },
          type: 'père grand-père',
        },
        {
          data: {
            pname: [
              {
                last_name: 'CECILIA K',
                qualif: 'nudsdater',
                content: 'CECILIA Knudsdater',
              },
              {
                last_name: 'KNUD',
                first_name: 'saint',
                qualif: '',
                content: 'saint KNUD',
              },
            ],
            content: ['Sa grand-mère maternelle est', ', fille de', ';'],
          },
          type: 'mère fille',
        },
        {
          data: {
            pname: {
              last_name: 'ESBERN S',
              qualif: 'nare',
              content: 'ESBERN Snare',
            },
            dates: {
              date: {
                certitude: true,
                type: 'single',
                content: 1204,
              },
            },
            content: ['Son frère est', ', \u2020', ';'],
          },
          type: 'frère',
        },
        {
          data: {
            pname: {
              last_name: 'SUNE S',
              qualif: 'kjalmsen',
              content: 'SUNE Skjalmsen',
            },
            content: ['Son oncle paternel est', ';'],
          },
          type: 'oncle',
        },
        {
          data: {
            pname: {
              last_name: 'PETRUS S',
              ptitle: {
                text_before: 'évêque',
                text_after: '',
                see: ' PETRUS S',
                empty_word: 'de',
                content: 'Roskilde',
              },
              qualif: 'unonis évêque de',
              content: 'PETRUS Sunonis, évêque de',
            },
            dates: {
              fromDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1192,
                },
              },
              toDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1214,
                },
              },
            },
            content: ['Son cousin germain est', ',', ';'],
          },
          type: 'cousin',
        },
        {
          data: {
            pname: {
              last_name: 'ANDREAS S',
              ptitle: {
                text_before: 'archevêque',
                text_after: '',
                see: ' ANDREAS S',
                empty_word: 'de',
                content: 'Lund',
              },
              qualif: 'unonis archevêque de',
              content: 'ANDREAS Sunonis, archevêque de',
            },
            content: ['Son cousin germain est', ', %1201-1228;'],
          },
          type: 'cousin',
        },
        {
          data: {
            pname: {
              last_name: 'SUNE E',
              qualif: 'bbesen',
              content: 'SUNE Ebbesen',
            },
            content: ['Son &cognatus& est', '.'],
          },
          source: 'DD: 1re série, II, n° 128, 130.',
        },
      ];

      let exp6 = [
        { name: { value: 'ASSER Skjalmsen Rig' }, type: 'father' },
        { name: { value: 'INGER Eriksdater' }, type: 'mother' },
        {
          name: { value: 'ERIK de Västergötland,  jarl de Falster' },
          type: 'grandfather',
        },
        {
          name: { value: 'CECILIA Knudsdater, saint KNUD' },
          type: 'grandmother',
        },
        { name: { value: 'ESBERN Snare' }, type: 'brother' },
        { name: { value: 'SUNE Skjalmsen' }, type: 'uncle' },
        {
          name: { value: 'PETRUS Sunonis, évêque de Roskilde' },
          type: 'cousin',
        },
        {
          name: { value: 'ANDREAS Sunonis, archevêque de Lund' },
          type: 'cousin',
        },
        { name: { value: 'SUNE Ebbesen' }, type: 'other' },
      ];

      let res6 = relationalParser.parseFamilyNetwork(ex6);
      expect(res6).toEqual(exp6);

      done();
    });
  });

  describe('relational.parser.parseFriends', function() {
    it('should return null if no value at all', function(done) {
      expect(relationalParser.parseFriends(null)).toBe(null);
      expect(relationalParser.parseFriends('')).toBe(null);
      expect(relationalParser.parseFriends({})).toBe(null);
      expect(relationalParser.parseFriends([])).toBe(null);
      done();
    });

    it('should return a value with an array if value exists', function(done) {
      let ex1 = [
        {
          data: {
            pname: {
              last_name: 'MONTREUIL',
              first_name: 'Jean de',
              qualif: '',
              content: 'Jean de MONTREUIL',
            },
            content: ['Ami de', ';'],
          },
        },
        {
          data: {
            pname: {
              last_name: 'CLAMANGES',
              first_name: 'Nicolas de',
              qualif: '',
              content: 'Nicolas de CLAMANGES',
            },
            content: ['Ami de', ';'],
          },
        },
        {
          data: {
            pname: {
              last_name: 'GERSON',
              first_name: 'Jean',
              qualif: '',
              content: 'Jean GERSON',
            },
            content: ['Ami de', ';'],
          },
        },
        {
          data: {
            pname: {
              last_name: 'MACHET',
              first_name: 'Gérard',
              qualif: '',
              content: 'Gérard MACHET',
            },
            content: ['Ami de', '.'],
          },
        },
      ];

      let exp1 = [
        { name: { value: 'Jean de MONTREUIL' }, type: 'friend' },
        { name: { value: 'Nicolas de CLAMANGES' }, type: 'friend' },
        { name: { value: 'Jean GERSON' }, type: 'friend' },
        { name: { value: 'Gérard MACHET' }, type: 'friend' },
      ];

      let res1 = relationalParser.parseFriends(ex1);
      expect(res1).toEqual(exp1);

      done();
    });

    it('should return a value with a single object if value exists', function(done) {
      let ex2 = {
        data: {
          pname: {
            last_name: 'BONIFACE VIII',
            qualif: '',
            content: 'BONIFACE VIII',
          },
          content: ['Conseiller de', '.'],
        },
      };
      let exp2 = [{ name: { value: 'BONIFACE VIII' }, type: 'friend' }];
      let res2 = relationalParser.parseFriends(ex2);
      //FIXME : KO
      expect(res2).toEqual(exp2);

      done();
    });
  });

  describe('relational.parser.parseRelations', function() {
    it('should return null if no value at all', function(done) {
      expect(relationalParser.parseFriends(null)).toBe(null);
      expect(relationalParser.parseFriends('')).toBe(null);
      expect(relationalParser.parseFriends({})).toBe(null);
      expect(relationalParser.parseFriends([])).toBe(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      let ex1 = {
        data: {
          pname: {
            last_name: 'CHARLES',
            ptitle: {
              text_before: 'duc',
              text_after: '',
              see: ' CHARLES',
              empty_word: "d'",
              content: 'Alençon',
            },
            qualif: "duc d'",
            content: "CHARLES, duc d'",
          },
          dates: {
            date: {
              certitude: true,
              type: 'single',
              content: 1344,
            },
          },
          content: ['Familier de', ', en', '.'],
        },
        source: 'COURTENAY, &Parisian Scholars ...&, p.196.',
      };

      let exp1 = [{ name: { value: "CHARLES, duc d' Alençon" } }];

      let res1 = relationalParser.parseRelations(ex1);
      expect(res1).toEqual(exp1);

      let ex2 = [
        {
          data: {
            pname: {
              last_name: 'LOUIS II',
              ptitle: {
                text_before: 'duc',
                text_after: '',
                see: ' LOUIS II',
                empty_word: 'de',
                content: 'Bourbon',
              },
              qualif: 'duc de',
              content: 'LOUIS II, duc de',
            },
            dates: {
              date: {
                certitude: true,
                type: 'single',
                content: 1394,
              },
            },
            content: ['Familier de', ',', ';'],
          },
          comment: {
            data: {
              pname: {
                last_name: 'LOUIS II',
                ptitle: {
                  text_before: 'duc',
                  text_after: '',
                  see: ' LOUIS II',
                  empty_word: 'de',
                  content: 'Bourbon',
                },
                qualif: 'duc de',
                content: 'LOUIS II, duc de',
              },
              dates: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1394,
                },
              },
              content: [
                'Il apparaît en',
                'comme comme bachelier en théologie et familier de',
                '.',
              ],
            },
          },
          source: [
            'SULLIVAN Theol.: II p.131-133.',
            'GOROCHOV: p.410, n.19, 469 et 728.',
          ],
        },
        {
          data: {
            pname: {
              last_name: 'LOUIS II',
              ptitle: {
                text_before: 'duc',
                text_after: '',
                see: ' LOUIS II',
                empty_word: 'de',
                content: 'Bourbon',
              },
              qualif: 'duc de',
              content: 'LOUIS II, duc de',
            },
            dates: {
              fromDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1403,
                },
              },
              toDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1405,
                },
              },
            },
            content: ['Aumônier de', ', entre', ';'],
          },
          comment: {
            data: {
              pname: {
                last_name: 'LOUIS II',
                ptitle: {
                  text_before: 'duc',
                  text_after: '',
                  see: ' LOUIS II',
                  empty_word: 'de',
                  content: 'Bourbon',
                },
                qualif: 'duc de',
                content: 'LOUIS II, duc de',
              },
              dates: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1405,
                },
              },
              content: [
                'Il apparaît en',
                'dans une supplique qui le décrit comme aumônier et confesseur de',
                '.',
              ],
            },
          },
          source: ['SULLIVAN Theol.: II p.131-133.', 'GOROCHOV: p.728.'],
        },
        {
          data: {
            pname: {
              last_name: 'LOUIS II',
              ptitle: {
                text_before: 'duc',
                text_after: '',
                see: ' LOUIS II',
                empty_word: 'de',
                content: 'Bourbon',
              },
              qualif: 'duc de',
              content: 'LOUIS II, duc de',
            },
            dates: {
              fromDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1403,
                },
              },
              toDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1405,
                },
              },
            },
            content: ['Confesseur de', ', entre', ';'],
          },
          comment: {
            data: {
              pname: {
                last_name: 'LOUIS II',
                ptitle: {
                  text_before: 'duc',
                  text_after: '',
                  see: ' LOUIS II',
                  empty_word: 'de',
                  content: 'Bourbon',
                },
                qualif: 'duc de',
                content: 'LOUIS II, duc de',
              },
              dates: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1405,
                },
              },
              content: [
                'Il apparaît en',
                'dans une supplique qui le décrit comme aumônier et confesseur de',
                '.',
              ],
            },
          },
          source: ['SULLIVAN Theol.: II p.131-133.', 'GOROCHOV: p.728.'],
        },
        {
          data: {
            pname: {
              last_name: 'CHARLES VII',
              ptitle: {
                text_before: 'roi',
                text_after: '',
                see: ' CHARLES VII',
                empty_word: 'de',
                content: 'France',
              },
              qualif: 'roi de',
              content: 'CHARLES VII, roi de',
            },
            dates: {
              fromDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1420,
                },
              },
              toDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1426,
                },
              },
            },
            content: ['Service de', ',', ';'],
          },
          comment: {
            data: {
              pname: {
                last_name: 'CANTELLA',
                first_name: 'Petrus de',
                qualif: '',
                content: 'Petrus de CANTELLA',
              },
              dates: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1420,
                },
              },
              place: 'Languedoc',
              content: [
                'Au service du dauphin comme conseiller,',
                "l'accompagne en voyage dans le",
                ', et reçoit comme dédommagement la somme de 100 livres tournois en février',
                '.',
              ],
            },
          },
          source: 'SULLIVAN Theol.: II p.131-133.',
        },
        {
          data: {
            pname: {
              last_name: 'CHARLES VII',
              ptitle: {
                text_before: 'roi',
                text_after: '',
                see: ' CHARLES VII',
                empty_word: 'de',
                content: 'France',
              },
              qualif: 'roi de',
              content: 'CHARLES VII, roi de',
            },
            dates: {
              fromDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1420,
                },
              },
              toDate: {
                date: {
                  certitude: true,
                  type: 'single',
                  content: 1426,
                },
              },
            },
            content: ['Confesseur de', ',', '.'],
          },
          source: 'SULLIVAN Theol.: II p.131-133.',
        },
      ];

      let exp2 = [
        { name: { value: 'LOUIS II, duc de Bourbon' } },
        { name: { value: 'LOUIS II, duc de Bourbon' } },
        { name: { value: 'LOUIS II, duc de Bourbon' } },
        { name: { value: 'CHARLES VII, roi de France' } },
        { name: { value: 'CHARLES VII, roi de France' } },
      ];

      let res2 = relationalParser.parseRelations(ex2);
      expect(res2).toEqual(exp2);
      done();
    });
  });

  describe('relational.parser.parseSocialClassOrigin', function() {
    it('should return null if no value at all', function(done) {
      expect(relationalParser.parseSocialClassOrigin(null)).toBe(null);
      expect(relationalParser.parseSocialClassOrigin('')).toBe(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      expect(relationalParser.parseSocialClassOrigin({})).toEqual(null);
      let ex1 = {
        data: 'Haute noblesse.',
        comment: {
          data: {
            ptitle: {
              text_before: 'royaume',
              text_after: '',
              empty_word: 'de',
              content: 'Danemark',
            },
            content: [
              'il appartenait à une des familles les plus puissantes du royaume de',
              ', les HVIDE.',
            ],
          },
        },
      };
      let exp1 = { value: 'Haute noblesse.' };
      expect(relationalParser.parseSocialClassOrigin(ex1.data)).toEqual(exp1);
      done();
    });
  });

  describe('relational.parser.parseControversyOrDebates', function() {
    it('should return null if no value at all', function(done) {
      expect(relationalParser.parseControversyOrDebates(null)).toBe(null);
      expect(relationalParser.parseControversyOrDebates('')).toBe(null);
      expect(relationalParser.parseControversyOrDebates({})).toBe(null);
      expect(relationalParser.parseControversyOrDebates([])).toBe(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      let ex1 = [
        {
          data: {
            pname: {
              last_name: 'AUBRIOT',
              first_name: 'Hugues',
              qualif: 'prévôt de Paris',
              content: 'Hugues AUBRIOT, prévôt de Paris',
            },
            dates: {
              date: {
                certitude: true,
                type: 'single',
                content: 1381,
              },
            },
            content: ['Impliqué dans la lutte contre', 'en', ';'],
          },
        },
        {
          data: {
            pname: {
              last_name: 'BLANCHART',
              ptitle: {
                text_before: "l'",
                text_after: '',
                see: 'Jean  BLANCHART',
                empty_word: '',
                content: 'Université',
              },
              first_name: 'Jean',
              qualif: "chancelier de l'",
              content: "Jean BLANCHART, chancelier de l'",
            },
            dates: {
              date: {
                certitude: true,
                type: 'single',
                content: 1385,
              },
            },
            content: [
              'Impliqué dans une polémique avec',
              'en',
              'sur le coût élevés des diplômes imposés par ce dernier ;',
            ],
          },
          comment: { data: 'Il le force à démissionner.' },
        },
        {
          data: {
            pname: {
              last_name: 'MONZON',
              first_name: 'Juan de',
              qualif: 'dominicain aragonais',
              content: 'Juan de MONZON, dominicain aragonais',
            },
            dates: {
              date: {
                type: 'circa',
                content: 1385,
              },
            },
            content: [
              'Impliqué dans une polémique avec',
              ", contempteur de l'Immaculée Conception",
              ';',
            ],
          },
          comment: {
            data:
              'Il persuade le roi de se séparer de ce dernier comme aumônier et prend ainsi sa place.',
          },
        },
        {
          data: {
            pname: {
              last_name: 'HUS',
              first_name: 'Jean',
              qualif: '',
              content: 'Jean HUS',
            },
            content: [
              'Impliqué dans la condamnation de',
              "dont la doctrine lui semble menacer les fondements mêmes de l'Eglise comme de la société.",
            ],
          },
        },
      ];

      let exp1 = [
        {
          value:
            'Impliqué dans la lutte contre Hugues AUBRIOT, prévôt de Paris en 1381 ;',
        },
        {
          value:
            "Impliqué dans une polémique avec Jean BLANCHART, chancelier de l' Université en 1385 sur le coût élevés des diplômes imposés par ce dernier ;",
        },
        {
          value:
            "Impliqué dans une polémique avec Juan de MONZON, dominicain aragonais , contempteur de l'Immaculée Conception 1385 ;",
        },
        {
          value:
            "Impliqué dans la condamnation de Jean HUS dont la doctrine lui semble menacer les fondements mêmes de l'Eglise comme de la société.",
        },
      ];
      expect(relationalParser.parseControversyOrDebates([ex1[0]])).toEqual([
        exp1[0],
      ]);
      expect(relationalParser.parseControversyOrDebates([ex1[1]])).toEqual([
        exp1[1],
      ]);
      expect(relationalParser.parseControversyOrDebates([ex1[2]])).toEqual([
        exp1[2],
      ]);
      expect(relationalParser.parseControversyOrDebates([ex1[3]])).toEqual([
        exp1[3],
      ]);

      let res1 = relationalParser.parseControversyOrDebates(ex1);
      expect(res1).toEqual(exp1);
      done();
    });
  });

  describe('relational.parser.buildRelationalInsertion', function() {
    it('should return null if no value at all', function(done) {
      expect(relationalParser.buildRelationalInsertion(null)).toBe(null);
      expect(relationalParser.buildRelationalInsertion('')).toBe(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      expect(relationalParser.buildRelationalInsertion({})).toEqual({});

      const json = {
        prosop: {
          person: {
            relationelInsertion: {
              familyNetwork: [
                {
                  data: {
                    pname: {
                      last_name: 'ASSER S',
                      qualif: 'kjalmsen Rig',
                      content: 'ASSER Skjalmsen Rig',
                    },
                    content: ['Son père est', ';'],
                  },
                  type: 'père',
                },
              ],
              socialClassOrigin: {
                data: 'Haute noblesse.',
                comment: {
                  data: {
                    ptitle: {
                      text_before: 'royaume',
                      text_after: '',
                      empty_word: 'de',
                      content: 'Danemark',
                    },
                    content: [
                      'il appartenait à une des familles les plus puissantes du royaume de',
                      ', les HVIDE.',
                    ],
                  },
                },
              },
              personalServiceRelationship: {
                data: {
                  pname: {
                    last_name: 'CHARLES',
                    ptitle: {
                      text_before: 'duc',
                      text_after: '',
                      see: ' CHARLES',
                      empty_word: "d'",
                      content: 'Alençon',
                    },
                    qualif: "duc d'",
                    content: "CHARLES, duc d'",
                  },
                  dates: {
                    date: {
                      certitude: true,
                      type: 'single',
                      content: 1344,
                    },
                  },
                  content: ['Familier de', ', en', '.'],
                },
                source: 'COURTENAY, &Parisian Scholars ...&, p.196.',
              },
              friends: [
                {
                  data: {
                    pname: {
                      last_name: 'ÉTIENNE DE TOURNAI',
                      qualif: '',
                      content: 'ÉTIENNE DE TOURNAI',
                    },
                    ptitle: {
                      text_before: 'abbé',
                      text_after: 'abbaye',
                      empty_word: 'de',
                      content: 'Sainte-Geneviève',
                    },
                    content: ['Ami de', ', abbé de', '(abbaye);'],
                  },
                },
              ],
              specificGroup: [
                {
                  data: {
                    pname: {
                      last_name: 'BENOÎT XIII',
                      qualif: '',
                      content: 'BENOÎT XIII',
                    },
                    content: ['Partisan du pape', ';'],
                  },
                  comment: {
                    data: {
                      ptitle: {
                        text_before: "l'Université",
                        text_after: '',
                        empty_word: 'de',
                        content: 'Paris',
                      },
                      dates: {
                        date: {
                          certitude: true,
                          type: 'single',
                          content: 1408,
                        },
                      },
                      content: [
                        "En raison de ce soutien, l'Université de",
                        'cherche sans doute à le sanctionner en',
                        '.',
                      ],
                    },
                  },
                  source: 'SULLIVAN Theol.: II p.131-133.',
                },
                {
                  data: {
                    ptitle: {
                      text_before: '?Partisan',
                      text_after: '',
                      empty_word: 'des',
                      content: 'Armagnacs',
                    },
                    content: ['?Partisan des', '.'],
                  },
                  comment: {
                    data:
                      "Les relations entretenues avec certains d'entre eux pourraient amener à penser qu'il serait lui même un de leur partisan. Par conséquent certains maîtres de l'Université vont voter pour sa condamnation.",
                  },
                  source: [
                    'SULLIVAN Theol.: II p.131-133.',
                    'CUP: IV p.272 (2001), 274 (2003) et 279 (2012).',
                  ],
                },
              ],
              polemic: [
                {
                  data: {
                    pname: {
                      last_name: 'AUBRIOT',
                      first_name: 'Hugues',
                      qualif: 'prévôt de Paris',
                      content: 'Hugues AUBRIOT, prévôt de Paris',
                    },
                    dates: {
                      date: {
                        certitude: true,
                        type: 'single',
                        content: 1381,
                      },
                    },
                    content: ['Impliqué dans la lutte contre', 'en', ';'],
                  },
                },
              ],
              politicalLinks: [
                { data: 'Partisan de la primauté du concile sur le pape ;' },
                {
                  data: {
                    pname: {
                      last_name: 'LOUIS',
                      qualif: "d'Orléans",
                      content: "LOUIS d'Orléans",
                    },
                    content: ['Partisan de', '.'],
                  },
                },
              ],
              professionalLinks: [
                {
                  data: {
                    pname: {
                      last_name: 'ANJOU',
                      first_name: "Louis d'",
                      qualif: '',
                      content: "Louis d'ANJOU",
                    },
                    dates: {
                      date: {
                        certitude: true,
                        type: 'single',
                        content: 1384,
                      },
                    },
                    content: ['Pas apprécié de', 'mort en', ';'],
                  },
                },
                {
                  data: {
                    pname: {
                      last_name: 'GERSON',
                      first_name: 'Jean',
                      qualif: '',
                      content: 'Jean GERSON',
                    },
                    content: [
                      'Protecteur de',
                      'qui le seconde dans son poste de chancelier ;',
                    ],
                  },
                  comment: {
                    data: {
                      pname: {
                        last_name: 'LA TREMOILLE',
                        first_name: 'Louis de',
                        qualif: '',
                        content: 'Louis de LA TREMOILLE',
                      },
                      ptitle: {
                        text_before: "l'évêché",
                        text_after: '',
                        empty_word: 'de',
                        content: 'Cambrai',
                      },
                      content: [
                        "Il n'est pas apprécié par le duc de Bourgogne car son candidat pour l'évêché de",
                        'a été écarté.',
                      ],
                    },
                  },
                },
              ],
              executor: [
                {
                  data: {
                    pname: {
                      last_name: 'COURTECUISSE',
                      first_name: 'Jean',
                      qualif: '',
                      content: 'Jean COURTECUISSE',
                    },
                    dates: {
                      date: {
                        certitude: true,
                        type: 'single',
                        content: 1424,
                      },
                    },
                    content: ['Exécuteur testamentaire de', 'en', '.'],
                  },
                  source: 'GOROCHOV: p.599-600.',
                },
              ],
              'student-professor': [
                {
                  data: {
                    pname: {
                      last_name: 'SABURGO',
                      first_name: 'Johannes de',
                      qualif: '',
                      content: 'Johannes de SABURGO',
                    },
                    content: ['Son maître est', 'pour le baccalauréat.'],
                  },
                  source: 'AUP: I 79 34.',
                },
              ],
              regularCorrespondence: {
                data: {
                  pname: {
                    last_name: 'CLAMANGES',
                    first_name: 'Nicolas de',
                    qualif: '',
                    content: 'Nicolas de CLAMANGES',
                  },
                  dates: {
                    fromDate: {
                      date: {
                        certitude: true,
                        type: 'circa',
                        content: 1408,
                      },
                    },
                    toDate: {
                      date: {
                        certitude: true,
                        type: 'single',
                        content: 1411,
                      },
                    },
                  },
                  content: ['Correspondance avec', '.'],
                },
                comment: {
                  data: {
                    pname: {
                      last_name: 'CLAMANGES',
                      first_name: 'Nicolas de',
                      qualif: '',
                      content: 'Nicolas de CLAMANGES',
                    },
                    dates: {
                      date: {
                        certitude: true,
                        type: 'single',
                        content: 1410,
                      },
                    },
                    content: [
                      'lui fait parvenir son traité &De fructu heremi&, rédigé en',
                      '.',
                    ],
                  },
                },
                source: ['GOROCHOV: p.688.', 'SULLIVAN Theol.: II p.441-443.'],
              },
            },
          },
        },
      };

      const expected = {
        familyNetwork: [
          { name: { value: 'ASSER Skjalmsen Rig' }, type: 'father' },
        ],
        socialClassOrigin: { value: 'Haute noblesse.' },
        personalServicesRelationship: [
          { name: { value: "CHARLES, duc d' Alençon" } },
        ],
        friends: [{ name: { value: 'ÉTIENNE DE TOURNAI' } }],
        controversyOrDebates: [
          {
            value:
              'Impliqué dans la lutte contre Hugues AUBRIOT, prévôt de Paris en 1381 ;',
          },
        ],
        memberOfGroups: [
          { value: 'Partisan du pape BENOÎT XIII ;' },
          { value: '?Partisan des Armagnacs .' },
        ],
        politicalRelationships: [
          { value: 'Partisan de la primauté du concile sur le pape ;' },
          { value: "Partisan de LOUIS d'Orléans ." },
        ],
        professionalRelationships: [
          { value: "Pas apprécié de Louis d'ANJOU mort en 1384 ;" },
          {
            value:
              'Protecteur de Jean GERSON qui le seconde dans son poste de chancelier ;',
          },
        ],
        willExecutor: [
          { value: 'Exécuteur testamentaire de Jean COURTECUISSE en 1424 .' },
        ],
        studentProfessorRelationships: [
          { value: 'Son maître est Johannes de SABURGO pour le baccalauréat.' },
        ],
        connectionsWith: [
          { value: 'Correspondance avec Nicolas de CLAMANGES .' },
        ],
      };
      let res1 = relationalParser.buildRelationalInsertion(json);
      expect(res1.socialClassOrigin).toEqual(expected.socialClassOrigin);
      expect(res1.familyNetwork).toEqual(expected.familyNetwork);
      expect(res1.personalServicesRelationship).toEqual(
        expected.personalServicesRelationship
      );
      expect(res1.friends).toEqual(expected.friends);
      expect(res1.controversyOrDebates).toEqual(expected.controversyOrDebates);
      expect(res1.memberOfGroups).toEqual(expected.memberOfGroups);
      expect(res1.politicalRelationships).toEqual(
        expected.politicalRelationships
      );
      expect(res1.professionalRelationships).toEqual(
        expected.professionalRelationships
      );
      expect(res1.willExecutor).toEqual(expected.willExecutor);
      expect(res1.studentProfessorRelationships).toEqual(
        expected.studentProfessorRelationships
      );
      expect(res1.connectionsWith).toEqual(expected.connectionsWith);

      expect(res1).toEqual(expected);
      done();
    });
  });
});
