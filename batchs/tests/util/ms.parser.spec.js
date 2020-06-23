// @flow

import {expect} from 'chai';
import { parseMS } from '../../src/rawFilesParser/util/ms.parser';

describe('MS Parser', () => {

  // detectTitles
  describe('parseMS', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const titles = parseMS(line);
      // then
      expect(titles).to.eql(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const titles = parseMS(line);
      // then
      expect(titles).to.eql(null);
    });
    it('should parse OK', () => {
      // given
      const line = "MS. Praha, Knih. Metrop. Kap. O.6, f. 119-141.";
      // when
      const ms = parseMS(line);
      //exptected
      const exptected = {
        place : "Praha",
        placeType: "Knih. Metrop. Kap.",
        cote: "O.6",
        page: "f. 119-141.",
      };

      // then
      expect(ms).to.eql(exptected);
    });
  });
});
