import MongoImporter from '../src/mongo.importer';

describe('mongo.importer', () => {
  describe('mongo.importer.importProsopography', () => {
    it('should raise error if no db', () => {
      expect(MongoImporter.importProsopography(null, {})).rejects.toEqual(
        'missing params'
      );
    });
    it('should raise error if no item', () => {
      expect(MongoImporter.importProsopography({}, null)).rejects.toEqual(
        'missing params'
      );
    });
  });
});
