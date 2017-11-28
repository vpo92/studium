'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const UtilParser = require('../src/util.parser');

describe('util.parser', function(){

  describe("util.parser.findProperty",function(){
      it("should return null if no value att all", function(done){
        expect(UtilParser.findProperty(null,null)).to.be.a('null');
        expect(UtilParser.findProperty({},"")).to.be.a('null');
        expect(UtilParser.findProperty("","")).to.be.a('null');
        done();
      });

      it("should return null if no json value", function(done){
        expect(UtilParser.findProperty(null,"prop")).to.be.a('null');
        expect(UtilParser.findProperty({},"prop")).to.be.a('null');
        expect(UtilParser.findProperty("","prop")).to.be.a('null');
        done();
      });

      it("should return null if value is not present", function(done){
        expect(UtilParser.findProperty({'key':"value"},"prop")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        expect(UtilParser.findProperty({'prop':'value'},"prop")).to.equals('value');
        expect(UtilParser.findProperty({'level1':{'level2':'value'}},"level1.level2")).to.equals('value');
        expect(UtilParser.findProperty({'level1':{'level-2':'value'}},"level1.level-2")).to.equals('value');
        const j = {'level1':{'level2':{'level3':'value'}}};
        expect(UtilParser.findProperty(j,"level1.level2.level3")).to.equals('value');
        expect(UtilParser.findProperty(j,"level1.level2")).to.eql({'level3':'value'});
        done();
      });
  });

  describe("indentity.parser.parseName",function(){
      it("should return null if no value att all", function(done){
        expect(UtilParser.parseName(null)).to.be.a('null');
        expect(UtilParser.parseName({})).to.be.a('null');
        expect(UtilParser.parseName("")).to.be.a('null');
        done();
      });
      it("should parse data correctly", function(done){
        const ex1 = "CÉSAR";
        expect(UtilParser.parseName(ex1)).to.eql({"value":"CÉSAR"});

        const ex2 ={"pname": {
                "last_name": "CAESAR",
                "qualif": "",
                "content": "CAESAR"
            }};
        expect(UtilParser.parseName(ex2)).to.eql({"value":"CAESAR"});

        done();
      });
    });


});
