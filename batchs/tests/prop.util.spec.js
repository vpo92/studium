// @flow

import {  addPropToRecord } from '../src/rawFilesParser/prop.util';

describe('Brand new parser', () => {

  describe('addPropToRecord', () => {
    it('should return a record with new value', () => {
      let record = {};
      let parsedLine = {"type":"DATA","value":{"prop":"value"}};
      const expected = {
        "prop":"value"
      };
      const res = addPropToRecord(record,parsedLine);
      expect(record).toEqual(expected);
    });
    it('should return a record with tab value if multiple value', () => {
      let record = {
        "prop":"value"
      };
      let parsedLine = {"type":"DATA","value":{"prop":"value2"}};
      const expected = {
        "prop":["value","value2"]
      };
      const res = addPropToRecord(record,parsedLine);
      expect(record).toEqual(expected);
    });

  });

});
