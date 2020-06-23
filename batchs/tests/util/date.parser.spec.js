// @flow

import {expect} from 'chai';
import { detectDates, isolateDates, parseDates } from '../../src/rawFilesParser/util/date.parser';

describe('Date Parser', () => {

  //Parse dates
  describe('parseDates', () => {
    it('should return null when no string is provided', () => {

      // when
      const dates = parseDates(null);
      // then
      expect(dates).to.eql(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const dates = parseDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should detect dates among string when dates is present', () => {
      // given
      const line = "1223";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'SIMPLE',
        "date": 1223,
      };
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - before', () => {
      // given
      const line = ":1403";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'BEFORE',
        "date": 1403,
      };
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - before with blanks', () => {
      // given
      const line = "    :1196";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'BEFORE',
        "date": 1196,
      };
      // then
      expect(dates).to.eql(expected);

    });
    it('should detect dates among string when dates is present - after', () => {
      // given
      const line = "1223:";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'AFTER',
        "date": 1223,
      };
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - near single', () => {
      // given
      const line = ":1223:";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'NEAR',
        "date": 1223,
      };
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - interval', () => {
      // given
      const line = "1246-1310";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        type: 'INTERVAL',
        startDate: {
          type: 'SIMPLE',
          date: 1246,
        },
        endDate: {
          type: 'SIMPLE',
          date: 1310,
        },
      };
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - near', () => {
      // given
      const line = ":1246:-:1310:";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        type: 'INTERVAL',
        startDate: {
          type: 'NEAR',
          date: 1246,
        },
        endDate: {
          type: 'NEAR',
          date: 1310,
        },
      };
      // then
      expect(dates).to.eql(expected);
    });
  });

  describe('isolateDates', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const dates = isolateDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const dates = isolateDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should detect no dates among string when no dates is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const dates = isolateDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should detect dates among string when dates is present', () => {
      // given
      const line = "a etudier à *Paris en %1403%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = ["1403"];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - before', () => {
      // given
      const line = "a etudier à *Paris %:1403%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = [":1403"];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - after', () => {
      // given
      const line = "a etudier à *Paris %1223:%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = ["1223:"];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - interval', () => {
      // given
      const line = "a etudier à *Paris %1246-1310%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = ["1246-1310"];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - near', () => {
      // given
      const line = "a etudier à *Paris %:1246:-:1310:%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = [":1246:-:1310:"];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when many dates are present', () => {
      // given
      const line = "a passer son enfance entre %:1246:-:1310:% et %:1403%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = [":1246:-:1310:", ":1403"];
      // then
      expect(dates).to.eql(expected);
    });
  });

  // detectDates
  describe('detectDates', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const dates = detectDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const dates = detectDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should detect no dates among string when no dates is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const dates = detectDates(line);
      // then
      expect(dates).to.eql(null);
    });
    it('should detect dates among string when dates is present', () => {
      // given
      const line = "a etudier à *Paris en %1403%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'SIMPLE',
        "date": 1403,
      }];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - before', () => {
      // given
      const line = "a etudier à *Paris %:1403%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'BEFORE',
        "date": 1403,
      }];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - after', () => {
      // given
      const line = "a etudier à *Paris %1223:%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'AFTER',
        "date": 1223,
      }];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - interval', () => {
      // given
      const line = "a etudier à *Paris %1246-1310%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'INTERVAL',
        "startDate": {
          "type": 'SIMPLE',
          "date": 1246,
        },
        "endDate": {
          "type": 'SIMPLE',
          "date": 1310,
        },
      }];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when dates is present - near', () => {
      // given
      const line = "a etudier à *Paris %:1246:-:1310:%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'INTERVAL',
        "startDate": {
          "type": 'NEAR',
          "date": 1246,
        },
        "endDate": {
          "type": 'NEAR',
          "date": 1310,
        },
      }];
      // then
      expect(dates).to.eql(expected);
    });
    it('should detect dates among string when many dates are present', () => {
      // given
      const line = "a passer son enfance entre %1246-1310% et %:1403%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'INTERVAL',
        "startDate": {
          "type": 'SIMPLE',
          "date": 1246,
        },
        "endDate": {
          "type": 'SIMPLE',
          "date": 1310,
        },
      },
      {
        "type": 'BEFORE',
        "date": 1403,
      }];
      // then
      expect(dates).to.eql(expected);
    });
  });
});
