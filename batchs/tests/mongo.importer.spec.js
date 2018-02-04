import MongoImporter from '../src/mongo.importer';

describe('mongo.importer', () => {
  describe('mongo.importer.importProsopography', () => {
    it('should raise error if no db', function(done) {
      MongoImporter.importProsopography(null, {})
        .then(() => {
          fail('should have raise error');
        })
        .catch(done());
    });

    it('should raise error if no item', function(done) {
      MongoImporter.importProsopography({}, null)
        .then(() => {
          fail('should have raise error');
        })
        .catch(done());
    });
  });
});
