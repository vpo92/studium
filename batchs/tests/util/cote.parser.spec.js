// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { detectCotes } from '../../src/rawFilesParser/util/cote.parser';

describe('Cote Parser', () => {

  // detectInstitutions
  describe('detectCote', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const cotes = detectCotes(line);
      // then
      expect(cotes).toEqual(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const cotes = detectCotes(line);
      // then
      expect(cotes).toEqual(null);
    });
    it('should detect no cote among string when no place is present', () => {
      // given
      const line = "this is a no institution value";
      // when
      const cotes = detectCotes(line);
      // then
      expect(cotes).toEqual(null);
    });
    it('should detect cote among string when institutions is present', () => {
      // given
      const line = "MS. *Paris, |BM #25";
      // when
      const cotes = detectCotes(line);
      // expected
      const expected = ["25"];
      // then
      expect(cotes).toEqual(expected);
    });
    it('should detect cote among string when many institutions are present', () => {
      // given
      const line = "MS. *Paris, |BM #25 et #35B";
      // when
      const cotes = detectCotes(line);
      // expected
      const expected = ["25","35B"];
      // then
      expect(cotes).toEqual(expected);
    });
  });

});
