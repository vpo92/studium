'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const OriginParser = require('../src/origin.parser');

describe('origin.parser', function(){

  describe("origin.parser.parsePlace",function(){
      it("should return null if no value att all", function(done){
        expect(OriginParser.parsePlace(null)).to.be.a('null');
        expect(OriginParser.parsePlace("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){

        const ex1 = {
                "place": "Rome",
                "content": ".",
        };

        expect(OriginParser.parsePlace(ex1)).eql({"value":"Rome"});

        const ex2 = {
            "place": [
                {
                    "annexe": "Champagne",
                    "content": "France",
                },
                "Champagne",
            ]};
        expect(OriginParser.parsePlace(ex2)).eql({"value":"Champagne"});

        done();
      });
  });

  describe("origin.parser.parseDiocese",function(){
      it("should return null if no value att all", function(done){
        expect(OriginParser.parseDiocese(null)).to.be.a('null');
        expect(OriginParser.parseDiocese("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        const ex1 = {
            "ptitle": {
                "text_before": "Diocèse",
                "text_after": "",
                "empty_word": "de",
                "content": "Châlons-en-Champagne",
            },
            "content": [
                "Diocèse de",
                ".",
            ]
        };
        expect(OriginParser.parseDiocese(ex1)).eql({"value":"Diocèse de Châlons-en-Champagne"});

        done();
      });
  });


  describe("origin.parser.buildOrigin",function(){
      it("should return null if no value att all", function(done){
        expect(OriginParser.buildOrigin(null)).to.be.a('null');
        expect(OriginParser.buildOrigin("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        expect(OriginParser.buildOrigin({})).to.eql({});

        const json = {"prosop": {"person": {
            "geo-origin": {
                "birthplace": {"data": {
                    "place": [
                        {
                            "annexe": "Champagne",
                            "content": "France"
                        },
                        "Champagne"
                    ],
                    "content": [
                        "(",
                        ")."
                    ]
                }},
                "diocese": {
                    "data": {
                        "ptitle": {
                            "text_before": "Diocèse",
                            "text_after": "",
                            "empty_word": "de",
                            "content": "Châlons-en-Champagne"
                        },
                        "content": [
                            "Diocèse de",
                            "."
                        ]
                    },
                    "source": "GOROCHOV: p.698-699."
                }
            },

          }}};

        const expected = {
            birthPlace:{"value": "Champagne"},
            diocese:{"value":"Diocèse de Châlons-en-Champagne"},
        };
        console.log(OriginParser.buildOrigin(json));
        expect(OriginParser.buildOrigin(json)).to.eql(expected);
        done();
      });
  });


});
