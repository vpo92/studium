// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { detectNames } from '../../src/rawFilesParser/util/name.parser';

describe('Name Parser', () => {

  // detectNames
  describe('detectNames', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const names = detectNames(line);
      // then
      expect(names).toEqual(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const names = detectNames(line);
      // then
      expect(names).toEqual(null);
    });
    it('should detect no name among string when no name is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const names = detectNames(line);
      // then
      expect(names).toEqual(null);
    });

    it('should detect name among string when only name is present', () => {
      // given
      const line = "$ACCURSIUS$";
      // when
      const names = detectNames(line);
      // expected
      const expected = ["ACCURSIUS"];
      // then
      expect(names).toEqual(expected);
    });
    it('should detect name among string when name is present', () => {
      // given
      const line = "ami de $Helluinus de FOSSICO$ durant un moment";
      // when
      const names = detectNames(line);
      // expected
      const expected = ["Helluinus de FOSSICO"];
      // then
      expect(names).toEqual(expected);
    });
    it('should detect names among string when many names are present', () => {
      // given
      const line = "en relation avec $Helluinus de FOSSICO$ et $CHARLES VII, roi de £France$";
      // when
      const names = detectNames(line);
      // expected
      const expected = ["Helluinus de FOSSICO","CHARLES VII, roi de £France"];
      // then
      expect(names).toEqual(expected);
    });
  });

});
