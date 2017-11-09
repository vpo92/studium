const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const MongoImporter = require('../src/mongo.importer');

describe('mongo.importer', function(){

  describe("mongo.importer.importProsopography",function(){

      it("should raise error if no db", function(done){
        MongoImporter.importProsopography(null,{})
          .then(function(){
            fail("should have raise error")
          })
          .catch(done());
      });

      it("should raise error if no item", function(done){
        MongoImporter.importProsopography({},null)
          .then(function(){
            fail("should have raise error")
          })
          .catch(done());
      });
  });
})
