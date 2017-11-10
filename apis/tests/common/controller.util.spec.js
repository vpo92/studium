'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const util = require('../../src/common/controller.util');

describe('controller.util', function(){

  describe('controller.util.handleError',function(){
    it("should work if no error provided",function(done){
      let res = {
        json : (data) => {
          expect(res.statusCode).to.eql(500);
        }
      }
      util.handleError(res)(null);
      done();
    });

    it("should work if error provided",function(done){
      let res = {
        json : (data) => {
          expect(res.statusCode).to.eql(500);
          expect(data).to.eql({error:'coucou'});
        }
      }
      util.handleError(res)('coucou');
      done();
    });
  });



  describe('controller.util.handleData',function(){
    it("should work if no data provided",function(done){
      let res = {
        json : (data) => {
          expect(res.statusCode).to.eql(200);
          expect(data).to.eql(null);
        }
      }
      util.handleData(res)(null);
      done();
    });

    it("should work if data provided",function(done){
      let res = {
        json : (data) => {
          expect(res.statusCode).to.eql(200);
          expect(data).to.eql('coucou');
        }
      }
      util.handleData(res)('coucou');
      done();
    });

  });

});
