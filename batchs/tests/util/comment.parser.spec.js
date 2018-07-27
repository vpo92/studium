// @flow

import { isComment } from '../../src/rawFilesParser/util/comment.parser';

describe('Comment Parser', () => {

  // isComment
  describe('isComment', () => {
    it('should return false when no string is provided', () => {
      // given
      const line = null;
      // when
      const comment = isComment(line);
      // then
      expect(comment).toEqual(false);
    });
    it('should return false when empty string is provided', () => {
      // given
      const line = "";
      // when
      const comment = isComment(line);
      // then
      expect(comment).toEqual(false);
    });
    it('should return false when no comment', () => {
      // given
      const line = "this is a no name value";
      // when
      const comment = isComment(line);
      // then
      expect(comment).toEqual(false);
    });
    it('should return false when http link', () => {
      // given
      const line = "//a etudier à *Paris au début du siècle";
      // when
      const comment = isComment(line);
      // then
      expect(comment).toEqual(false);
    });
    it('should return true when comment is present', () => {
      // given
      const line = "/a passer son enfance entre *Paris et *Marseille";
      // when
      const comment = isComment(line);
      // then
      expect(comment).toEqual(true);
    });
  });

});
