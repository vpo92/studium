'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const controller = require('../../src/prosopography/prosopography.controller');

describe('prosopography.controller', function(){

  describe("prosopography.controller.findAll",function(){
      it("should raise error if wrong db", function(done){
        let res = {
          json : (data) => {
            console.log(data);
            expect(data.error).to.eql('error retriving connexion to database');
          },
        }
        controller.findAll(null,res);
        expect(res.statusCode).to.eql(500);
        done();
      });
      /**
      it("should work with valid db", function(done){
          fail('not yes implemented');
          done()
      });*/
  });
});
