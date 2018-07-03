// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { detectPlaces } from '../../src/rawFilesParser/util/place.parser';

describe('Place Parser', () => {

  // detectPlaces
  describe('detectPlaces', () => {
    it('should return null when no string is provided', () => {
      // given
      const line = null;
      // when
      const places = detectPlaces(line);
      // then
      expect(places).toEqual(null);
    });
    it('should return null when empty string is provided', () => {
      // given
      const line = "";
      // when
      const places = detectPlaces(line);
      // then
      expect(places).toEqual(null);
    });
    it('should detect no place among string when no place is present', () => {
      // given
      const line = "this is a no name value";
      // when
      const places = detectPlaces(line);
      // then
      expect(places).toEqual(null);
    });
    it('should detect place among string when places is present', () => {
      // given
      const line = "a etudier à *Paris au début du siècle";
      // when
      const places = detectPlaces(line);
      // expected
      const expected = ["Paris"];
      // then
      expect(places).toEqual(expected);
    });
    it('should detect places among string when many places are present', () => {
      // given
      const line = "a passer son enfance entre *Paris et *Marseille";
      // when
      const places = detectPlaces(line);
      // expected
      const expected = ["Paris","Marseille"];
      // then
      expect(places).toEqual(expected);
    });
  });

});
