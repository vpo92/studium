// @flow

import {expect} from 'chai';
import { Readable } from 'stream';
import fs from 'fs';

import { detectTitles } from '../../src/rawFilesParser/util/title.parser';

describe('Name Parser', () => {

  // detectTitles
  describe('detectTitles', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const titles = detectTitles(line);
      // then
      expect(titles).to.eql(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const titles = detectTitles(line);
      // then
      expect(titles).to.eql(null);
    });
    it('should detect no name among string when no name is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const titles = detectTitles(line);
      // then
      expect(titles).to.eql(null);
    });
    it('should detect name among string when name is present', () => {
      // given
      const line = "ami de &Le rouge et le noir& durant un moment";
      // when
      const titles = detectTitles(line);
      // expected
      const expected = ["Le rouge et le noir"];
      // then
      expect(titles).to.eql(expected);
    });
    it('should detect titles among string when many titles are present', () => {
      // given
      const line = "en relation avec &titre 1& et &titre 2&";
      // when
      const titles = detectTitles(line);
      // expected
      const expected = ["titre 1", "titre 2"];
      // then
      expect(titles).to.eql(expected);
    });
  });

});
