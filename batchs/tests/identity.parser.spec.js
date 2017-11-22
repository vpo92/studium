'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const IndentityParser = require('../src/identity.parser');

describe('indentity.parser.findProperty', function(){

  describe("indentity.parser.findProperty",function(){
      it("should return null if no value att all", function(done){
        expect(IndentityParser.findProperty(null,null)).to.be.a('null');
        expect(IndentityParser.findProperty({},"")).to.be.a('null');
        expect(IndentityParser.findProperty("","")).to.be.a('null');
        done();
      });

      it("should return null if no json value", function(done){
        expect(IndentityParser.findProperty(null,"prop")).to.be.a('null');
        expect(IndentityParser.findProperty({},"prop")).to.be.a('null');
        expect(IndentityParser.findProperty("","prop")).to.be.a('null');
        done();
      });

      it("should return null if value is not present", function(done){
        expect(IndentityParser.findProperty({'key':"value"},"prop")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        expect(IndentityParser.findProperty({'prop':'value'},"prop")).to.equals('value');
        expect(IndentityParser.findProperty({'level1':{'level2':'value'}},"level1.level2")).to.equals('value');
        expect(IndentityParser.findProperty({'level1':{'level-2':'value'}},"level1.level-2")).to.equals('value');
        const j = {'level1':{'level2':{'level3':'value'}}};
        expect(IndentityParser.findProperty(j,"level1.level2.level3")).to.equals('value');
        expect(IndentityParser.findProperty(j,"level1.level2")).to.eql({'level3':'value'});
        done();
      });
  });

  describe("indentity.parser.parseDates",function(){
      it("should return null if no value att all", function(done){
        expect(IndentityParser.parseDates(null)).to.be.a('null');
        expect(IndentityParser.parseDates({})).to.be.a('null');
        expect(IndentityParser.parseDates("")).to.be.a('null');
        done();
      });

      it("should parse data correctly", function(done){


        const ex1 = {"dates": {
                "fromDate": {"date": {
                    "certitude": true,
                    "type": "circa",
                    "content": 1128
                }},
                "toDate": {"date": {
                    "certitude": true,
                    "type": "single",
                    "content": 1201
                }}
            }};
        expect(IndentityParser.parseDates(ex1)).to.eql({'from':'1128','to':'1201'});

        const ex2 = "%  -1494%";
        expect(IndentityParser.parseDates(ex2)).to.eql({'from':'%','to':'1494%'});

        const ex3 = "%     -    %";
        expect(IndentityParser.parseDates(ex3)).to.eql({'from':'%','to':'%'});


        const ex4 = {"dates": {
            "fromDate": {"date": {"type": null}},
            "toDate": {"date": {
                "certitude": true,
                "type": "single",
                "content": 1312
            }}
        }};
        expect(IndentityParser.parseDates(ex4)).to.eql({'from':'%','to':'1312'});

        const ex5 = {"dates": {"date": {
            "certitude": true,
            "type": "single",
            "content": 1302
        }}};

        expect(IndentityParser.parseDates(ex5)).to.eql({'from':'1302','to':'1302'});

        const ex6 = {"dates": {"toDate": {"date": {
            "certitude": false,
            "type": "single",
            "content": 1424
        }}}}

        expect(IndentityParser.parseDates(ex6)).to.eql({'from':'%','to':'1424'});

        const ex7 = {"dates": {"fromDate": {"date": {
            "certitude": false,
            "type": "single",
            "content": 1424
        }}}}

        expect(IndentityParser.parseDates(ex7)).to.eql({'from':'1424','to':'%'});

        expect(IndentityParser.parseDates("?")).to.be.a('null');

        done();
      });
    });

    describe("indentity.parser.parseName",function(){
        it("should return null if no value att all", function(done){
          expect(IndentityParser.parseName(null)).to.be.a('null');
          expect(IndentityParser.parseName({})).to.be.a('null');
          expect(IndentityParser.parseName("")).to.be.a('null');
          done();
        });
        it("should parse data correctly", function(done){
          const ex1 = "CÉSAR";
          expect(IndentityParser.parseName(ex1)).to.eql({"value":"CÉSAR"});

          const ex2 ={"pname": {
                  "last_name": "CAESAR",
                  "qualif": "",
                  "content": "CAESAR"
              }};
          expect(IndentityParser.parseName(ex2)).to.eql({"value":"CAESAR"});

          done();
        });
      });


    describe("indentity.parser.parseNameVariant",function(){
        it("should return null if no value att all", function(done){
          expect(IndentityParser.parseNameVariant(null)).to.be.a('null');
          expect(IndentityParser.parseNameVariant({})).to.be.a('null');
          expect(IndentityParser.parseNameVariant("")).to.be.a('null');
          done();
        });
        it("should parse data correctly", function(done){
          const ex1 = {
              "data": {"pname": {
                  "last_name": "FIDELIS",
                  "first_name": "A.",
                  "qualif": "",
                  "content": "A. FIDELIS"
              }},
              "source": "CUP: IV n°2028."
          };
          expect(IndentityParser.parseNameVariant(ex1)).to.eql([{"value":"A. FIDELIS"}]);
          const ex2 = [
              {"data": {"pname": {
                  "last_name": "CAESAR",
                  "qualif": "",
                  "content": "CAESAR"
              }}},
              {"data": "CÉSAR"}
          ];
          expect(IndentityParser.parseNameVariant(ex2)).to.eql([{"value":"CAESAR"},{"value":"CÉSAR"}]);
          done();
        });
      });



  describe("indentity.parser.parseDescription",function(){
      it("should return null if no value att all", function(done){
        expect(IndentityParser.parseDescription(null)).to.be.a('null');
        expect(IndentityParser.parseDescription("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){

        const ex1 = {
            "ptitle": {
                "text_before": "collège",
                "text_after": "",
                "empty_word": "de",
                "content": "Navarre"
            },
            "content": [
                "Boursier artien au collège de",
                "."
            ]
        };

        expect(IndentityParser.parseDescription(ex1)).to.eql({"value":"Boursier artien au collège de Navarre"});

        const ex2 = {
            "ptitle": {
                "text_before": "collège",
                "text_after": "",
                "empty_word": "de",
                "content": "Navarre"
            },
            "place": "Paris",
            "content": [
                "Boursier artien au collège de",
                "à",
                "."
            ]
        };
        expect(IndentityParser.parseDescription(ex2)).to.eql({"value":"Boursier artien au collège de Navarre à Paris"});

        done();


      })
  });


  describe("indentity.parser.buildIdentity",function(){
      it("should return null if no value att all", function(done){
        expect(IndentityParser.buildIdentity(null)).to.be.a('null');
        expect(IndentityParser.buildIdentity("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        expect(IndentityParser.buildIdentity({})).to.eql({gender:{"value":"male"}});

        const json = {"prosop": {"person": {
            "label": {
                "description": {"data": "Notaire"},
                "personID": {"data": 1},
                "variant-name": {
                    "data": {"pname": {
                        "last_name": "FIDELIS",
                        "first_name": "A.",
                        "qualif": "",
                        "content": "A. FIDELIS"
                    }},
                    "source": "CUP: IV n°2028."
                },
                "usage-name": {"data": "A. Fidelis"},
                "statut": {"data": "Extérieur"},
                "datesOfLife": {
                    "data": {"dates": {
                        "fromDate": {"date": {
                            "certitude": true,
                            "type": "circa",
                            "content": 1128
                        }},
                        "toDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1201
                        }}
                    }},
                    "comment": {"data": {
                        "ptitle": {
                            "text_before": "l'abbaye",
                            "text_after": "",
                            "empty_word": "de",
                            "content": "Sorø"
                        },
                        "content": [
                            "il est mort le 21 mars 1201 et inhumé à l'abbaye de",
                            "."
                        ]
                    }}
                },
                "datesOfActivity": {"data": {"dates": {
                    "fromDate": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1414
                    }},
                    "toDate": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1414
                    }}
                }
              }},
              "sex": {
                  "data": "Femme ?",
                  "comment": {"data": {
                      "pname": {
                          "last_name": "HAYA",
                          "first_name": "Adam de",
                          "qualif": "",
                          "content": "Adam de HAYA"
                      },
                      "content": [
                          "Il s'agit probablement d'une femme bien que la forme \"ADA\" soit parfois trouvé pour un hommes (cf.",
                          ")."
                      ]
                  }}
              }
            }}}};

        const expected = {
            name:{"value": "A. Fidelis"},
            description:{"value":"Notaire"},
            gender:{"value":"female"},
            status:{"value":"external"},
            nameVariant:[{"value":"A. FIDELIS"}],
            datesOfLife:{'from':'1128','to':'1201'},
            datesOfActivity:{'from':'1414','to':'1414'}
        };

        expect(IndentityParser.buildIdentity(json)).to.eql(expected);

        //FIXME : create method for complexe parsing

        done();
      });
  });


});
