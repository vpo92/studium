'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const UtilParser = require('../src/util.parser');

describe('util.parser', function() {
  describe('util.parser.findProperty', function() {
    it('should return null if no value att all', function(done) {
      expect(UtilParser.findProperty(null, null)).to.be.a('null');
      expect(UtilParser.findProperty({}, '')).to.be.a('null');
      expect(UtilParser.findProperty('', '')).to.be.a('null');
      done();
    });

    it('should return null if no json value', function(done) {
      expect(UtilParser.findProperty(null, 'prop')).to.be.a('null');
      expect(UtilParser.findProperty({}, 'prop')).to.be.a('null');
      expect(UtilParser.findProperty('', 'prop')).to.be.a('null');
      done();
    });

    it('should return null if value is not present', function(done) {
      expect(UtilParser.findProperty({ key: 'value' }, 'prop')).to.be.a('null');
      done();
    });

    it('should return a value if value exists', function(done) {
      expect(UtilParser.findProperty({ prop: 'value' }, 'prop')).to.equals(
        'value'
      );
      expect(
        UtilParser.findProperty(
          { level1: { level2: 'value' } },
          'level1.level2'
        )
      ).to.equals('value');
      expect(
        UtilParser.findProperty(
          { level1: { 'level-2': 'value' } },
          'level1.level-2'
        )
      ).to.equals('value');
      const j = { level1: { level2: { level3: 'value' } } };
      expect(UtilParser.findProperty(j, 'level1.level2.level3')).to.equals(
        'value'
      );
      expect(UtilParser.findProperty(j, 'level1.level2')).to.eql({
        level3: 'value',
      });
      done();
    });
  });

  describe('indentity.parser.parseName', function() {
    it('should return null if no value att all', function(done) {
      expect(UtilParser.parseName(null)).to.be.a('null');
      expect(UtilParser.parseName({})).to.be.a('null');
      expect(UtilParser.parseName('')).to.be.a('null');
      done();
    });
    it('should parse data correctly', function(done) {
      const ex1 = 'CÉSAR';
      expect(UtilParser.parseName(ex1)).to.eql({ value: 'CÉSAR' });

      const ex2 = {
        pname: {
          last_name: 'CAESAR',
          qualif: '',
          content: 'CAESAR',
        },
      };
      expect(UtilParser.parseName(ex2)).to.eql({ value: 'CAESAR' });

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
      let res3 = UtilParser.parseName(ex3);
      expect(res3).to.eql({ value: 'CECILIA Knudsdatter, saint KNUD' });

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

      let res4 = UtilParser.parseName(ex4);
      expect(res4).to.eql({ value: "CHARLES, duc d' Alençon" });

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

      let res5 = UtilParser.parseName(ex5);
      expect(res5).to.eql({ value: 'VALDEMAR Ier' });

      done();
    });
  });
});
