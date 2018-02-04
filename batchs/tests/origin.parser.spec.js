import originParser from '../src/origin.parser';

describe('origin.parser', () => {
  describe('origin.parser.parsePlace', () => {
    it('should return null if no value att all', function(done) {
      expect(originParser.parsePlace(null)).toEqual(null);
      expect(originParser.parsePlace('')).toEqual(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      const ex1 = {
        place: 'Rome',
        content: '.',
      };

      expect(originParser.parsePlace(ex1)).toEqual({ value: 'Rome' });

      const ex2 = {
        place: [
          {
            annexe: 'Champagne',
            content: 'France',
          },
          'Champagne',
        ],
      };
      expect(originParser.parsePlace(ex2)).toEqual({ value: 'Champagne' });

      done();
    });
  });

  describe('origin.parser.parseDiocese', () => {
    it('should return null if no value att all', function(done) {
      expect(originParser.parseDiocese(null)).toEqual(null);
      expect(originParser.parseDiocese('')).toEqual(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      const ex1 = {
        ptitle: {
          text_before: 'Diocèse',
          text_after: '',
          empty_word: 'de',
          content: 'Châlons-en-Champagne',
        },
        content: ['Diocèse de', '.'],
      };
      expect(originParser.parseDiocese(ex1)).toEqual({
        value: 'Diocèse de Châlons-en-Champagne',
      });

      done();
    });
  });

  describe('origin.parser.buildOrigin', () => {
    it('should return null if no value att all', function(done) {
      expect(originParser.buildOrigin(null)).toEqual(null);
      expect(originParser.buildOrigin('')).toEqual(null);
      done();
    });

    it('should return a value if value exists', function(done) {
      expect(originParser.buildOrigin({})).toEqual({});

      const json = {
        prosop: {
          person: {
            'geo-origin': {
              birthplace: {
                data: {
                  place: [
                    {
                      annexe: 'Champagne',
                      content: 'France',
                    },
                    'Champagne',
                  ],
                  content: ['(', ').'],
                },
              },
              diocese: {
                data: {
                  ptitle: {
                    text_before: 'Diocèse',
                    text_after: '',
                    empty_word: 'de',
                    content: 'Châlons-en-Champagne',
                  },
                  content: ['Diocèse de', '.'],
                },
                source: 'GOROCHOV: p.698-699.',
              },
            },
          },
        },
      };

      const expected = {
        birthPlace: { value: 'Champagne' },
        diocese: { value: 'Diocèse de Châlons-en-Champagne' },
      };
      console.log(originParser.buildOrigin(json));
      expect(originParser.buildOrigin(json)).toEqual(expected);
      done();
    });
  });
});
