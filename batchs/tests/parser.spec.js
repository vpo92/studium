// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { parseLine } from '../src/rawFilesParser/parser';

describe('Parser', () => {

  // parseLine
  describe('parseLine', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const cotes = parseLine(line);
      // then
      expect(cotes).toEqual({"typeOfLine": "IGNORE"});
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const cotes = parseLine(line);
      // then
      expect(cotes).toEqual({"typeOfLine": "IGNORE"});
    });
    it('should detect DATA Line for 1a', () => {
      // given
      const line = "<1a> this is a no institution value";
      // when
      const cotes = parseLine(line);
      // then
      expect(cotes).toEqual({"data": {"isOpus": false, "name": "reference", "value": "this is a no institution value"}, "meta": {"dates": null, "institutions": null, "cotes": null, "isComment": false, "isLink": false, "names": null, "places": null, "titles": null}, "typeOfLine": "DATA"});
    });
    it('should detect cote among string when institutions is present', () => {
      // given
      const line = "<<c>> MS. *Paris, |BnF lat. #14927, f.164-175 ;";
      // when
      const cotes = parseLine(line);
      // expected
      const expected = {"data": {"isOpus": false, "name": "manuscrits", "value": "MS. *Paris, |BnF lat. #14927, f.164-175 ;"}, "meta": {"cotes": ["14927,"], "dates": null, "institutions": ["BnF"], "isComment": false, "isLink": false, "names": null, "places": ["Paris,"], "titles": null}, "typeOfLine": "OPUSDATA"};
      // then
      expect(cotes).toEqual(expected);
    });
    it('should detect MS info among string when many MS are present', () => {
      // given
      const line = "<22> MS. *Paris, |BM #25 et #35B";
      // when
      const cotes = parseLine(line);
      // expected
      const expected = {"data": {"isOpus": false, "name": "philosophyExtended", "value": "MS. *Paris, |BM #25 et #35B"}, "meta": {"dates": null, "institutions": ["BM"], "cotes": ["25","35B"], "isComment": false, "isLink": false, "names": null, "places": ["Paris,"], "titles": null}, "typeOfLine": "DATA"};
      // then
      expect(cotes).toEqual(expected);
    });
  });

});
