// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { detectDates, isolateDates, parseDates } from '../../src/rawFilesParser/util/date.parser';

describe('Date Parser', () => {

  //Parse dates
  describe('parseDates', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const dates = parseDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const dates = parseDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should detect dates among string when dates is present', () => {
      // given
      const line = "1223";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'SIMPLE',
        "startDate": {
          "value": new Date("1223"),
          "certain": true
        },
      };
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - before', () => {
      // given
      const line = ":1403";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'INTERVAL',
        "endDate": {
          "value": new Date("1403"),
          "certain": true
        },
      };
      // then
      expect(dates).toEqual(expected);


      // given
      const line2 = "    :1196";
      // when
      const dates2 = parseDates(line2);
      // expected
      const expected2 = {
        "type": 'INTERVAL',
        "endDate": {
          "value": new Date("1196"),
          "certain": true
        },
      };
      // then
      expect(dates2).toEqual(expected2);

    });
    it('should detect dates among string when dates is present - after', () => {
      // given
      const line = "1223:";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date("1223"),
          "certain": true
        },
      };
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - interval', () => {
      // given
      const line = "1246-1310";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date("1246"),
          "certain": true
        },
        "endDate": {
          "value": new Date("1310"),
          "certain": true
        },
      };
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - near', () => {
      // given
      const line = ":1246:-:1310:";
      // when
      const dates = parseDates(line);
      // expected
      const expected = {
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date("1246"),
          "certain": false
        },
        "endDate": {
          "value": new Date("1310"),
          "certain": false
        },
      };
      // then
      expect(dates).toEqual(expected);
    });
  });


  // isolateDates
  describe('isolateDates', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const dates = isolateDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const dates = isolateDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should detect no dates among string when no dates is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const dates = isolateDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should detect dates among string when dates is present', () => {
      // given
      const line = "a etudier à *Paris en %1403%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = ["1403"];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - before', () => {
      // given
      const line = "a etudier à *Paris %:1403%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = [":1403"];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - after', () => {
      // given
      const line = "a etudier à *Paris %1223:%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = ["1223:"];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - interval', () => {
      // given
      const line = "a etudier à *Paris %1246-1310%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = ["1246-1310"];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - near', () => {
      // given
      const line = "a etudier à *Paris :1246:-:1310:";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = [":1246:-:1310:"];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when many dates are present', () => {
      // given
      const line = "a passer son enfance entre %:1246:-:1310:% et %:1403%";
      // when
      const dates = isolateDates(line);
      // expected
      const expected = [":1246:-:1310:",":1403"];
      // then
      expect(dates).toEqual(expected);
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
      expect(dates).toEqual(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const dates = detectDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should detect no dates among string when no dates is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const dates = detectDates(line);
      // then
      expect(dates).toEqual(null);
    });
    it('should detect dates among string when dates is present', () => {
      // given
      const line = "a etudier à *Paris en %1403%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'SIMPLE',
        "startDate": {
          "value": new Date("1403"),
          "certain": true
        },
      }];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - before', () => {
      // given
      const line = "a etudier à *Paris %:1403%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'INTERVAL',
        "endDate": {
          "value": new Date("1403"),
          "certain": true
        },
      }];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - after', () => {
      // given
      const line = "a etudier à *Paris %1223:%";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date("1223"),
          "certain": true
        },
      }];
      // then
      expect(dates).toEqual(expected);
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
          "value": new Date("1246"),
          "certain": true
        },
        "endDate": {
          "value": new Date("1310"),
          "certain": true
        },
      }];
      // then
      expect(dates).toEqual(expected);
    });
    it('should detect dates among string when dates is present - near', () => {
      // given
      const line = "a etudier à *Paris :1246:-:1310:";
      // when
      const dates = detectDates(line);
      // expected
      const expected = [{
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date("1246"),
          "certain": false
        },
        "endDate": {
          "value": new Date("1310"),
          "certain": false
        },
      }];
      // then
      expect(dates).toEqual(expected);
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
          "value": new Date("1246"),
          "certain": true
        },
        "endDate": {
          "value": new Date("1310"),
          "certain": true
        },
      },
      {
        "type": 'INTERVAL',
        "endDate": {
          "value": new Date("1403"),
          "certain": true
        }
      }];
      // then
      expect(dates).toEqual(expected);
    });
  });


});
