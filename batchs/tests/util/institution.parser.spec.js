// @flow

import {expect} from 'chai';
import { Readable } from 'stream';
import fs from 'fs';

import { detectInstitutions } from '../../src/rawFilesParser/util/institution.parser';

describe('Place Parser', () => {

  // detectInstitutions
  describe('detectInstitutions', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const institutions = detectInstitutions(line);
      // then
      expect(institutions).to.eql(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const institutions = detectInstitutions(line);
      // then
      expect(institutions).to.eql(null);
    });
    it('should detect no place among string when no place is present', () => {
      // given
      const line = "this is a no institution value";
      // when
      const institutions = detectInstitutions(line);
      // then
      expect(institutions).to.eql(null);
    });
    it('should detect place among string when institutions is present', () => {
      // given
      const line = "a etudier à la £Sorbonne au début du siècle";
      // when
      const institutions = detectInstitutions(line);
      // expected
      const expected = ["Sorbonne"];
      // then
      expect(institutions).to.eql(expected);
    });
    it('should detect institutions among string when many institutions are present', () => {
      // given
      const line = "a passer son enfance entre la £Sorbonne et l'£Armée";
      // when
      const institutions = detectInstitutions(line);
      // expected
      const expected = ["Sorbonne","Armée"];
      // then
      expect(institutions).to.eql(expected);
    });
  });

});
