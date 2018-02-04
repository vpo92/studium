import utilParser from '../src/util.parser';

describe('util.parser', function() {
  describe('util.parser.findProperty', function() {
    it('should return null if no value att all', function(done) {
      expect(utilParser.findProperty(null, null)).toEqual(null);
      expect(utilParser.findProperty({}, '')).toEqual(null);
      expect(utilParser.findProperty('', '')).toEqual(null);
      done();
    });

    it('should return null if no json value', function(done) {
      expect(utilParser.findProperty(null, 'prop')).toEqual(null);
      expect(utilParser.findProperty({}, 'prop')).toEqual(null);
      expect(utilParser.findProperty('', 'prop')).toEqual(null);
      done();
    });

    it('should return null if value is not present', function(done) {
      expect(utilParser.findProperty({ key: 'value' }, 'prop')).toEqual(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      expect(utilParser.findProperty({ prop: 'value' }, 'prop')).toEqual(
        'value'
      );
      expect(
        utilParser.findProperty(
          { level1: { level2: 'value' } },
          'level1.level2'
        )
      ).toEqual('value');
      expect(
        utilParser.findProperty(
          { level1: { 'level-2': 'value' } },
          'level1.level-2'
        )
      ).toEqual('value');
      const j = { level1: { level2: { level3: 'value' } } };
      expect(utilParser.findProperty(j, 'level1.level2.level3')).toEqual(
        'value'
      );
      expect(utilParser.findProperty(j, 'level1.level2')).toEqual({
        level3: 'value',
      });
      done();
    });
  });

  describe('indentity.parser.parseName', function() {
    it('should return null if no value att all', function(done) {
      expect(utilParser.parseName(null)).toEqual(null);
      expect(utilParser.parseName({})).toEqual(null);
      expect(utilParser.parseName('')).toEqual(null);
      done();
    });
    it('should parse data correctly', function(done) {
      const ex1 = 'CÉSAR';
      expect(utilParser.parseName(ex1)).toEqual({ value: 'CÉSAR' });

      const ex2 = {
        pname: {
          last_name: 'CAESAR',
          qualif: '',
          content: 'CAESAR',
        },
      };
      expect(utilParser.parseName(ex2)).toEqual({ value: 'CAESAR' });

      const ex3 = {
        pname: [
          {
            last_name: 'CECILIA K',
            qualif: 'nudsdatter',
            content: 'CECILIA Knudsdatter',
          },
          {
            last_name: 'KNUD',
            first_name: 'saint',
            qualif: '',
            content: 'saint KNUD',
          },
        ],
      };
      let res3 = utilParser.parseName(ex3);
      expect(res3).toEqual({ value: 'CECILIA Knudsdatter, saint KNUD' });

      let ex4 = {
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
      };

      let res4 = utilParser.parseName(ex4);
      expect(res4).toEqual({ value: "CHARLES, duc d' Alençon" });

      let ex5 = {
        pname: {
          last_name: 'VALDEMAR I',
          qualif: 'er',
          content: 'VALDEMAR Ier',
        },
        ptitle: {
          text_before: 'roi',
          text_after: '',
          empty_word: 'de',
          content: 'Danemark',
        },
        content: ['Ami du', ', roi de', ', avec lequel il a été élevé.'],
      };

      let res5 = utilParser.parseName(ex5);
      expect(res5).toEqual({ value: 'VALDEMAR Ier' });

      done();
    });
  });
});
