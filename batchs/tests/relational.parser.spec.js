'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const assert = require('chai').assert;
const RelationalParser = require('../src/relational.parser');

describe('relational.parser', function(){




  describe("relational.parser.parseFamilyNetwork",function(){
    it("should return null if no value att all", function(done){
      expect(RelationalParser.parseFamilyNetwork(null)).to.be.a('null');
      expect(RelationalParser.parseFamilyNetwork("")).to.be.a('null');
      done();
    });

    it("should return null if wrong value", function(done){
      expect(RelationalParser.parseFamilyNetwork({})).to.eql(null);
      expect(RelationalParser.parseFamilyNetwork([])).to.be.a('null');
      done();
    });

    it("should return a value if value exists", function(done){

      let ex1 = [{
          "data": {
              "pname": {
                  "last_name": "ASSER S",
                  "qualif": "kjalmsen Rig",
                  "content": "ASSER Skjalmsen Rig"
              },
              "content": [
                  "Son père est",
                  ";"
              ]
          },
          "type": "père"
      }];

      let exp = [{
        "name":{"value":"ASSER Skjalmsen Rig"},
        "type":"father"
      }];

      expect(RelationalParser.parseFamilyNetwork(ex1)).to.deep.eql(exp);


      let ex2 = [{
          "data": {
              "pname": {
                  "last_name": "ASSER S",
                  "qualif": "kjalmsen Rig",
                  "content": "ASSER Skjalmsen Rig"
              },
              "content": [
                  "Son père est",
                  ";"
              ]
          },
          "type": "père"
      },{
          "data": {
              "pname": {
                  "last_name": "ERIK",
                  "ptitle": {
                      "text_before": "jarl",
                      "text_after": "",
                      "see": " ERIK=",
                      "empty_word": "de",
                      "content": "Falster"
                  },
                  "qualif": "de=Västergötland  jarl de",
                  "content": "ERIK de Västergötland,  jarl de"
              },
              "dates": {"date": {
                  "certitude": true,
                  "type": "single",
                  "content": 1145
              }},
              "content": [
                  "Son grand-père maternel est",
                  ", \u2020",
                  ";"
              ]
          },
          "type": "père grand-père"
      }];

      let exp2 = [{
        "name":{"value":"ASSER Skjalmsen Rig"},
        "type":"father"
      },
      {
        "name":{"value":"ERIK de Västergötland,  jarl de Falster"},
        "type":"grandfather"
      }];

      let res2 = RelationalParser.parseFamilyNetwork(ex2);
      expect(res2).to.deep.eql(exp2);

      let ex3 = [{
          "data": "Louis",
          "type": "frère"
      }];

      let exp3 = [{
        "name":{"value":"Louis"},
        "type":"brother"
      }];
      expect(RelationalParser.parseFamilyNetwork(ex3)).to.deep.eql(exp3);



      let ex4 = [{
          "data": {
              "pname": [
                  {
                      "last_name": "CECILIA K",
                      "qualif": "nudsdatter",
                      "content": "CECILIA Knudsdatter"
                  },
                  {
                      "last_name": "KNUD",
                      "first_name": "saint",
                      "qualif": "",
                      "content": "saint KNUD"
                  }
              ],
              "content": [
                  "Sa grand-mère maternelle est",
                  ", fille de",
                  ";"
              ]
          },
          "type": "mère fille"
      }];

      let exp4 = [{
        "name":{"value":"CECILIA Knudsdatter, saint KNUD"},
        "type":"grandmother"
      }];
      let res4 = RelationalParser.parseFamilyNetwork(ex4);
      expect(res4).to.deep.eql(exp4);


      let ex5 = [{
          "data": {
              "pname": {
                  "last_name": "ASSER S",
                  "qualif": "kjalmsen Rig",
                  "content": "ASSER Skjalmsen Rig"
              },
              "content": [
                  "Son père est",
                  ";"
              ]
          },
          "type": "grand frere de la soeur du fils",
      }];

      let exp5 = [{
        "name":{"value":"ASSER Skjalmsen Rig"},
        "type":"other",
      }];
      expect(RelationalParser.parseFamilyNetwork(ex5)).to.deep.eql(exp5);


      //extract from 8.json.xml
      let ex6 = [
          {
              "data": {
                  "pname": {
                      "last_name": "ASSER S",
                      "qualif": "kjalmsen Rig",
                      "content": "ASSER Skjalmsen Rig"
                  },
                  "content": [
                      "Son père est",
                      ";"
                  ]
              },
              "type": "père"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "INGER E",
                      "qualif": "riksdatter",
                      "content": "INGER Eriksdatter"
                  },
                  "content": [
                      "Sa mère est",
                      ";"
                  ]
              },
              "type": "mère"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "ERIK",
                      "ptitle": {
                          "text_before": "jarl",
                          "text_after": "",
                          "see": " ERIK=",
                          "empty_word": "de",
                          "content": "Falster"
                      },
                      "qualif": "de=Västergötland  jarl de",
                      "content": "ERIK de Västergötland,  jarl de"
                  },
                  "dates": {"date": {
                      "certitude": true,
                      "type": "single",
                      "content": 1145
                  }},
                  "content": [
                      "Son grand-père maternel est",
                      ", \u2020",
                      ";"
                  ]
              },
              "type": "père grand-père"
          },
          {
              "data": {
                  "pname": [
                      {
                          "last_name": "CECILIA K",
                          "qualif": "nudsdatter",
                          "content": "CECILIA Knudsdatter"
                      },
                      {
                          "last_name": "KNUD",
                          "first_name": "saint",
                          "qualif": "",
                          "content": "saint KNUD"
                      }
                  ],
                  "content": [
                      "Sa grand-mère maternelle est",
                      ", fille de",
                      ";"
                  ]
              },
              "type": "mère fille"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "ESBERN S",
                      "qualif": "nare",
                      "content": "ESBERN Snare"
                  },
                  "dates": {"date": {
                      "certitude": true,
                      "type": "single",
                      "content": 1204
                  }},
                  "content": [
                      "Son frère est",
                      ", \u2020",
                      ";"
                  ]
              },
              "type": "frère"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "SUNE S",
                      "qualif": "kjalmsen",
                      "content": "SUNE Skjalmsen"
                  },
                  "content": [
                      "Son oncle paternel est",
                      ";"
                  ]
              },
              "type": "oncle"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "PETRUS S",
                      "ptitle": {
                          "text_before": "évêque",
                          "text_after": "",
                          "see": " PETRUS S",
                          "empty_word": "de",
                          "content": "Roskilde"
                      },
                      "qualif": "unonis évêque de",
                      "content": "PETRUS Sunonis, évêque de"
                  },
                  "dates": {
                      "fromDate": {"date": {
                          "certitude": true,
                          "type": "single",
                          "content": 1192
                      }},
                      "toDate": {"date": {
                          "certitude": true,
                          "type": "single",
                          "content": 1214
                      }}
                  },
                  "content": [
                      "Son cousin germain est",
                      ",",
                      ";"
                  ]
              },
              "type": "cousin"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "ANDREAS S",
                      "ptitle": {
                          "text_before": "archevêque",
                          "text_after": "",
                          "see": " ANDREAS S",
                          "empty_word": "de",
                          "content": "Lund"
                      },
                      "qualif": "unonis archevêque de",
                      "content": "ANDREAS Sunonis, archevêque de"
                  },
                  "content": [
                      "Son cousin germain est",
                      ", %1201-1228;"
                  ]
              },
              "type": "cousin"
          },
          {
              "data": {
                  "pname": {
                      "last_name": "SUNE E",
                      "qualif": "bbesen",
                      "content": "SUNE Ebbesen"
                  },
                  "content": [
                      "Son &cognatus& est",
                      "."
                  ]
              },
              "source": "DD: 1re série, II, n° 128, 130."
          }
      ];

      let exp6 = [
        {"name":{"value":"ASSER Skjalmsen Rig"},"type":"father"},
        {"name":{"value":"INGER Eriksdatter"},"type":"mother"},
        {"name":{"value":"ERIK de Västergötland,  jarl de Falster"},"type":"grandfather"},
        {"name":{"value":"CECILIA Knudsdatter, saint KNUD"},"type":"grandmother"},
        {"name":{"value":"ESBERN Snare"},"type":"brother"},
        {"name":{"value":"SUNE Skjalmsen"},"type":"uncle"},
        {"name":{"value":"PETRUS Sunonis, évêque de Roskilde"},"type":"cousin"},
        {"name":{"value":"ANDREAS Sunonis, archevêque de Lund"},"type":"cousin"},
        {"name":{"value":"SUNE Ebbesen"},"type":"other"},
      ];

      let res6 = RelationalParser.parseFamilyNetwork(ex6);
      expect(res6).to.deep.eql(exp6);

      done();

    });
  });



  describe("relational.parser.parseFriends",function(){
      it("should return null if no value att all", function(done){
        expect(RelationalParser.parseFriends(null)).to.be.a('null');
        expect(RelationalParser.parseFriends("")).to.be.a('null');
        expect(RelationalParser.parseFriends({})).to.be.a('null');
        expect(RelationalParser.parseFriends([])).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){

        let ex1 = [
            {"data": {
                "pname": {
                    "last_name": "MONTREUIL",
                    "first_name": "Jean de",
                    "qualif": "",
                    "content": "Jean de MONTREUIL"
                },
                "content": [
                    "Ami de",
                    ";"
                ]
            }},
            {"data": {
                "pname": {
                    "last_name": "CLAMANGES",
                    "first_name": "Nicolas de",
                    "qualif": "",
                    "content": "Nicolas de CLAMANGES"
                },
                "content": [
                    "Ami de",
                    ";"
                ]
            }},
            {"data": {
                "pname": {
                    "last_name": "GERSON",
                    "first_name": "Jean",
                    "qualif": "",
                    "content": "Jean GERSON"
                },
                "content": [
                    "Ami de",
                    ";"
                ]
            }},
            {"data": {
                "pname": {
                    "last_name": "MACHET",
                    "first_name": "Gérard",
                    "qualif": "",
                    "content": "Gérard MACHET"
                },
                "content": [
                    "Ami de",
                    "."
                ]
            }}
        ];

        let exp1 = [
          {"name":{"value":"Jean de MONTREUIL"}, "type":"friend"},
          {"name":{"value":"Nicolas de CLAMANGES"}, "type":"friend"},
          {"name":{"value":"Jean GERSON"}, "type":"friend"},
          {"name":{"value":"Gérard MACHET"}, "type":"friend"},
        ];

        let res1 = RelationalParser.parseFriends(ex1);
        console.log(res1);
        expect(res1).to.eql(exp1);

        done();
      });
  });

  describe("relational.parser.parseRelations",function(){
      it("should return null if no value att all", function(done){
        expect(RelationalParser.parseFriends(null)).to.be.a('null');
        expect(RelationalParser.parseFriends("")).to.be.a('null');
        expect(RelationalParser.parseFriends({})).to.be.a('null');
        expect(RelationalParser.parseFriends([])).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        let ex1 = {
            "data": {
                "pname": {
                    "last_name": "CHARLES",
                    "ptitle": {
                        "text_before": "duc",
                        "text_after": "",
                        "see": " CHARLES",
                        "empty_word": "d'",
                        "content": "Alençon"
                    },
                    "qualif": "duc d'",
                    "content": "CHARLES, duc d'"
                },
                "dates": {"date": {
                    "certitude": true,
                    "type": "single",
                    "content": 1344
                }},
                "content": [
                    "Familier de",
                    ", en",
                    "."
                ]
            },
            "source": "COURTENAY, &Parisian Scholars ...&, p.196."
        };

        let exp1 = [
          {"name":{"value":"CHARLES, duc d' Alençon"}}
        ];

        let res1 = RelationalParser.parseRelations(ex1);
        console.log(res1);
        expect(res1).to.eql(exp1);

        let ex2 = [
            {
                "data": {
                    "pname": {
                        "last_name": "LOUIS II",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " LOUIS II",
                            "empty_word": "de",
                            "content": "Bourbon"
                        },
                        "qualif": "duc de",
                        "content": "LOUIS II, duc de"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1394
                    }},
                    "content": [
                        "Familier de",
                        ",",
                        ";"
                    ]
                },
                "comment": {"data": {
                    "pname": {
                        "last_name": "LOUIS II",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " LOUIS II",
                            "empty_word": "de",
                            "content": "Bourbon"
                        },
                        "qualif": "duc de",
                        "content": "LOUIS II, duc de"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1394
                    }},
                    "content": [
                        "Il apparaît en",
                        "comme comme bachelier en théologie et familier de",
                        "."
                    ]
                }},
                "source": [
                    "SULLIVAN Theol.: II p.131-133.",
                    "GOROCHOV: p.410, n.19, 469 et 728."
                ]
            },
            {
                "data": {
                    "pname": {
                        "last_name": "LOUIS II",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " LOUIS II",
                            "empty_word": "de",
                            "content": "Bourbon"
                        },
                        "qualif": "duc de",
                        "content": "LOUIS II, duc de"
                    },
                    "dates": {
                        "fromDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1403
                        }},
                        "toDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1405
                        }}
                    },
                    "content": [
                        "Aumônier de",
                        ", entre",
                        ";"
                    ]
                },
                "comment": {"data": {
                    "pname": {
                        "last_name": "LOUIS II",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " LOUIS II",
                            "empty_word": "de",
                            "content": "Bourbon"
                        },
                        "qualif": "duc de",
                        "content": "LOUIS II, duc de"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1405
                    }},
                    "content": [
                        "Il apparaît en",
                        "dans une supplique qui le décrit comme aumônier et confesseur de",
                        "."
                    ]
                }},
                "source": [
                    "SULLIVAN Theol.: II p.131-133.",
                    "GOROCHOV: p.728."
                ]
            },
            {
                "data": {
                    "pname": {
                        "last_name": "LOUIS II",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " LOUIS II",
                            "empty_word": "de",
                            "content": "Bourbon"
                        },
                        "qualif": "duc de",
                        "content": "LOUIS II, duc de"
                    },
                    "dates": {
                        "fromDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1403
                        }},
                        "toDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1405
                        }}
                    },
                    "content": [
                        "Confesseur de",
                        ", entre",
                        ";"
                    ]
                },
                "comment": {"data": {
                    "pname": {
                        "last_name": "LOUIS II",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " LOUIS II",
                            "empty_word": "de",
                            "content": "Bourbon"
                        },
                        "qualif": "duc de",
                        "content": "LOUIS II, duc de"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1405
                    }},
                    "content": [
                        "Il apparaît en",
                        "dans une supplique qui le décrit comme aumônier et confesseur de",
                        "."
                    ]
                }},
                "source": [
                    "SULLIVAN Theol.: II p.131-133.",
                    "GOROCHOV: p.728."
                ]
            },
            {
                "data": {
                    "pname": {
                        "last_name": "CHARLES VII",
                        "ptitle": {
                            "text_before": "roi",
                            "text_after": "",
                            "see": " CHARLES VII",
                            "empty_word": "de",
                            "content": "France"
                        },
                        "qualif": "roi de",
                        "content": "CHARLES VII, roi de"
                    },
                    "dates": {
                        "fromDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1420
                        }},
                        "toDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1426
                        }}
                    },
                    "content": [
                        "Service de",
                        ",",
                        ";"
                    ]
                },
                "comment": {"data": {
                    "pname": {
                        "last_name": "CANTELLA",
                        "first_name": "Petrus de",
                        "qualif": "",
                        "content": "Petrus de CANTELLA"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1420
                    }},
                    "place": "Languedoc",
                    "content": [
                        "Au service du dauphin comme conseiller,",
                        "l'accompagne en voyage dans le",
                        ", et reçoit comme dédommagement la somme de 100 livres tournois en février",
                        "."
                    ]
                }},
                "source": "SULLIVAN Theol.: II p.131-133."
            },
            {
                "data": {
                    "pname": {
                        "last_name": "CHARLES VII",
                        "ptitle": {
                            "text_before": "roi",
                            "text_after": "",
                            "see": " CHARLES VII",
                            "empty_word": "de",
                            "content": "France"
                        },
                        "qualif": "roi de",
                        "content": "CHARLES VII, roi de"
                    },
                    "dates": {
                        "fromDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1420
                        }},
                        "toDate": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1426
                        }}
                    },
                    "content": [
                        "Confesseur de",
                        ",",
                        "."
                    ]
                },
                "source": "SULLIVAN Theol.: II p.131-133."
            }
        ];

        let exp2 = [
          {"name":{"value":"LOUIS II, duc de Bourbon"}},
          {"name":{"value":"LOUIS II, duc de Bourbon"}},
          {"name":{"value":"LOUIS II, duc de Bourbon"}},
          {"name":{"value":"CHARLES VII, roi de France"}},
          {"name":{"value":"CHARLES VII, roi de France"}},
        ];

        let res2 = RelationalParser.parseRelations(ex2);
        console.log(res2);
        expect(res2).to.eql(exp2);
        done();

      });
    });





  describe("relational.parser.parseSocialClassOrigin",function(){
      it("should return null if no value att all", function(done){
        expect(RelationalParser.parseSocialClassOrigin(null)).to.be.a('null');
        expect(RelationalParser.parseSocialClassOrigin("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        expect(RelationalParser.parseSocialClassOrigin({})).to.eql(null);
        let ex1 = {
            "data": "Haute noblesse.",
            "comment": {"data": {
                "ptitle": {
                    "text_before": "royaume",
                    "text_after": "",
                    "empty_word": "de",
                    "content": "Danemark"
                },
                "content": [
                    "il appartenait à une des familles les plus puissantes du royaume de",
                    ", les HVIDE."
                ]
            }}
        };
        let exp1 = {"value":"Haute noblesse."}
        expect(RelationalParser.parseSocialClassOrigin(ex1.data)).to.eql(exp1);
        done();
      });

  });

  describe("relational.parser.parseControversyOrDebates",function(){
      it("should return null if no value att all", function(done){
        expect(RelationalParser.parseControversyOrDebates(null)).to.be.a('null');
        expect(RelationalParser.parseControversyOrDebates("")).to.be.a('null');
        expect(RelationalParser.parseControversyOrDebates({})).to.be.a('null');
        expect(RelationalParser.parseControversyOrDebates([])).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){

        let ex1 = [
            {"data": {
                "pname": {
                    "last_name": "AUBRIOT",
                    "first_name": "Hugues",
                    "qualif": "prévôt de Paris",
                    "content": "Hugues AUBRIOT, prévôt de Paris"
                },
                "dates": {"date": {
                    "certitude": true,
                    "type": "single",
                    "content": 1381
                }},
                "content": [
                    "Impliqué dans la lutte contre",
                    "en",
                    ";"
                ]
            }},
            {
                "data": {
                    "pname": {
                        "last_name": "BLANCHART",
                        "ptitle": {
                            "text_before": "l'",
                            "text_after": "",
                            "see": "Jean  BLANCHART",
                            "empty_word": "",
                            "content": "Université"
                        },
                        "first_name": "Jean",
                        "qualif": "chancelier de l'",
                        "content": "Jean BLANCHART, chancelier de l'"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1385
                    }},
                    "content": [
                        "Impliqué dans une polémique avec",
                        "en",
                        "sur le coût élevés des diplômes imposés par ce dernier ;"
                    ]
                },
                "comment": {"data": "Il le force à démissionner."}
            },
            {
                "data": {
                    "pname": {
                        "last_name": "MONZON",
                        "first_name": "Juan de",
                        "qualif": "dominicain aragonais",
                        "content": "Juan de MONZON, dominicain aragonais"
                    },
                    "dates": {"date": {
                        "type": "circa",
                        "content": 1385
                    }},
                    "content": [
                        "Impliqué dans une polémique avec",
                        ", contempteur de l'Immaculée Conception",
                        ";"
                    ]
                },
                "comment": {"data": "Il persuade le roi de se séparer de ce dernier comme aumônier et prend ainsi sa place."}
            },
            {"data": {
                "pname": {
                    "last_name": "HUS",
                    "first_name": "Jean",
                    "qualif": "",
                    "content": "Jean HUS"
                },
                "content": [
                    "Impliqué dans la condamnation de",
                    "dont la doctrine lui semble menacer les fondements mêmes de l'Eglise comme de la société."
                ]
            }}
        ];

        let exp1 = [
          {"value":"Impliqué dans la lutte contre Hugues AUBRIOT, prévôt de Paris en 1381 ;"},
          {"value":"Impliqué dans une polémique avec Jean BLANCHART, chancelier de l' Université en 1385 sur le coût élevés des diplômes imposés par ce dernier ;"},
          {"value":"Impliqué dans une polémique avec Juan de MONZON, dominicain aragonais , contempteur de l'Immaculée Conception 1385 ;"},
          {"value":"Impliqué dans la condamnation de Jean HUS dont la doctrine lui semble menacer les fondements mêmes de l'Eglise comme de la société."},
        ];
        console.log(RelationalParser.parseControversyOrDebates([ex1[0]]));
        expect(RelationalParser.parseControversyOrDebates([ex1[0]])).to.deep.eq([exp1[0]]);
        console.log(RelationalParser.parseControversyOrDebates([ex1[1]]));
        expect(RelationalParser.parseControversyOrDebates([ex1[1]])).to.deep.eq([exp1[1]]);
        console.log(RelationalParser.parseControversyOrDebates([ex1[2]]));
        expect(RelationalParser.parseControversyOrDebates([ex1[2]])).to.deep.eq([exp1[2]]);
        console.log(RelationalParser.parseControversyOrDebates([ex1[3]]));
        expect(RelationalParser.parseControversyOrDebates([ex1[3]])).to.deep.eq([exp1[3]]);

        let res1 = RelationalParser.parseControversyOrDebates(ex1);
        console.log(res1);
        expect(res1).to.deep.eq(exp1);
        done();

      });
  });


  describe("relational.parser.buildRelationalInsertion",function(){
      it("should return null if no value att all", function(done){
        expect(RelationalParser.buildRelationalInsertion(null)).to.be.a('null');
        expect(RelationalParser.buildRelationalInsertion("")).to.be.a('null');
        done();
      });

      it("should return a value if value exists", function(done){
        expect(RelationalParser.buildRelationalInsertion({})).to.eql({});

        const json = {"prosop": {"person": {"relationelInsertion":{
            "familyNetwork": [
                {
                    "data": {
                        "pname": {
                            "last_name": "ASSER S",
                            "qualif": "kjalmsen Rig",
                            "content": "ASSER Skjalmsen Rig"
                        },
                        "content": [
                            "Son père est",
                            ";"
                        ]
                    },
                    "type": "père"
                }
            ],
            "socialClassOrigin": {
                "data": "Haute noblesse.",
                "comment": {"data": {
                    "ptitle": {
                        "text_before": "royaume",
                        "text_after": "",
                        "empty_word": "de",
                        "content": "Danemark"
                    },
                    "content": [
                        "il appartenait à une des familles les plus puissantes du royaume de",
                        ", les HVIDE."
                    ]
                }}
            },
            "personalServicesRelationship":{
                "data": {
                    "pname": {
                        "last_name": "CHARLES",
                        "ptitle": {
                            "text_before": "duc",
                            "text_after": "",
                            "see": " CHARLES",
                            "empty_word": "d'",
                            "content": "Alençon"
                        },
                        "qualif": "duc d'",
                        "content": "CHARLES, duc d'"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1344
                    }},
                    "content": [
                        "Familier de",
                        ", en",
                        "."
                    ]
                },
                "source": "COURTENAY, &Parisian Scholars ...&, p.196."
            },
            "friends": [
                {"data": {
                    "pname": {
                        "last_name": "ÉTIENNE DE TOURNAI",
                        "qualif": "",
                        "content": "ÉTIENNE DE TOURNAI"
                    },
                    "ptitle": {
                        "text_before": "abbé",
                        "text_after": "abbaye",
                        "empty_word": "de",
                        "content": "Sainte-Geneviève"
                    },
                    "content": [
                        "Ami de",
                        ", abbé de",
                        "(abbaye);"
                    ]
                }},

            ],
            "specificGroup": [
                {
                    "data": {
                        "pname": {
                            "last_name": "BENOÎT XIII",
                            "qualif": "",
                            "content": "BENOÎT XIII"
                        },
                        "content": [
                            "Partisan du pape",
                            ";"
                        ]
                    },
                    "comment": {"data": {
                        "ptitle": {
                            "text_before": "l'Université",
                            "text_after": "",
                            "empty_word": "de",
                            "content": "Paris"
                        },
                        "dates": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1408
                        }},
                        "content": [
                            "En raison de ce soutien, l'Université de",
                            "cherche sans doute à le sanctionner en",
                            "."
                        ]
                    }},
                    "source": "SULLIVAN Theol.: II p.131-133."
                },
                {
                    "data": {
                        "ptitle": {
                            "text_before": "?Partisan",
                            "text_after": "",
                            "empty_word": "des",
                            "content": "Armagnacs"
                        },
                        "content": [
                            "?Partisan des",
                            "."
                        ]
                    },
                    "comment": {"data": "Les relations entretenues avec certains d'entre eux pourraient amener à penser qu'il serait lui même un de leur partisan. Par conséquent certains maîtres de l'Université vont voter pour sa condamnation."},
                    "source": [
                        "SULLIVAN Theol.: II p.131-133.",
                        "CUP: IV p.272 (2001), 274 (2003) et 279 (2012)."
                    ]
                }
            ],
            "polemic": [
                {"data": {
                    "pname": {
                        "last_name": "AUBRIOT",
                        "first_name": "Hugues",
                        "qualif": "prévôt de Paris",
                        "content": "Hugues AUBRIOT, prévôt de Paris"
                    },
                    "dates": {"date": {
                        "certitude": true,
                        "type": "single",
                        "content": 1381
                    }},
                    "content": [
                        "Impliqué dans la lutte contre",
                        "en",
                        ";"
                    ]
                }}],
                "politicalLinks":[
                    {"data": "Partisan de la primauté du concile sur le pape ;"},
                    {"data": {
                        "pname": {
                            "last_name": "LOUIS",
                            "qualif": "d'Orléans",
                            "content": "LOUIS d'Orléans"
                        },
                        "content": [
                            "Partisan de",
                            "."
                        ]
                    }}
                ],
                "professionalLinks": [
                    {"data": {
                        "pname": {
                            "last_name": "ANJOU",
                            "first_name": "Louis d'",
                            "qualif": "",
                            "content": "Louis d'ANJOU"
                        },
                        "dates": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1384
                        }},
                        "content": [
                            "Pas apprécié de",
                            "mort en",
                            ";"
                        ]
                    }},
                    {
                        "data": {
                            "pname": {
                                "last_name": "GERSON",
                                "first_name": "Jean",
                                "qualif": "",
                                "content": "Jean GERSON"
                            },
                            "content": [
                                "Protecteur de",
                                "qui le seconde dans son poste de chancelier ;"
                            ]
                        },
                        "comment": {"data": {
                            "pname": {
                                "last_name": "LA TREMOILLE",
                                "first_name": "Louis de",
                                "qualif": "",
                                "content": "Louis de LA TREMOILLE"
                            },
                            "ptitle": {
                                "text_before": "l'évêché",
                                "text_after": "",
                                "empty_word": "de",
                                "content": "Cambrai"
                            },
                            "content": [
                                "Il n'est pas apprécié par le duc de Bourgogne car son candidat pour l'évêché de",
                                "a été écarté."
                            ]
                        }}
                    }
                ],
                "executor":[{
                    "data": {
                        "pname": {
                            "last_name": "COURTECUISSE",
                            "first_name": "Jean",
                            "qualif": "",
                            "content": "Jean COURTECUISSE"
                        },
                        "dates": {"date": {
                            "certitude": true,
                            "type": "single",
                            "content": 1424
                        }},
                        "content": [
                            "Exécuteur testamentaire de",
                            "en",
                            "."
                        ]
                    },
                    "source": "GOROCHOV: p.599-600."
                }],
                "student-professor":[
                    {
                        "data": {
                            "pname": {
                                "last_name": "SABURGO",
                                "first_name": "Johannes de",
                                "qualif": "",
                                "content": "Johannes de SABURGO"
                            },
                            "content": [
                                "Son maître est",
                                "pour le baccalauréat."
                            ]
                        },
                        "source": "AUP: I 79 34."
                    }]
        }
      }}};

      //FIXME personalServicesRelationship

        const expected = {
          "familyNetwork": [
            {"name":{"value":"ASSER Skjalmsen Rig"},"type":"father"},
          ],
          "socialClassOrigin" : {"value":"Haute noblesse."},
          "personalServicesRelationship":[{"name":{"value":"CHARLES, duc d' Alençon"}}],
          "friends" : [{"name":{"value":"ÉTIENNE DE TOURNAI"}, "type": "friend"}],
          "controversyOrDebates": [{"value":"Impliqué dans la lutte contre Hugues AUBRIOT, prévôt de Paris en 1381 ;"}],
          "memberOfGroups":[{"value":"Partisan du pape BENOÎT XIII ;"},{"value":"?Partisan des Armagnacs ."}],
          "politicalRelationships" : [{"value":"Partisan de la primauté du concile sur le pape ;"},{"value":"Partisan de LOUIS d'Orléans ."}],
          "professionalRelationships": [{"value":"Pas apprécié de Louis d'ANJOU mort en 1384 ;"},{"value":"Protecteur de Jean GERSON qui le seconde dans son poste de chancelier ;"}],
          "willExecutor" : [{"value":"Exécuteur testamentaire de Jean COURTECUISSE en 1424 ."}],
          "studentProfessorRelationships":[{"value":"Son maître est Johannes de SABURGO pour le baccalauréat."}]
        };
        let res1 = RelationalParser.buildRelationalInsertion(json);
        expect(res1.socialClassOrigin).to.deep.eql(expected.socialClassOrigin);
        expect(res1.familyNetwork).to.deep.eql(expected.familyNetwork);
        expect(res1.personalServicesRelationship).to.deep.eql(expected.personalServicesRelationship);
        expect(res1.friends).to.deep.eql(expected.friends);
        expect(res1.controversyOrDebates).to.deep.eql(expected.controversyOrDebates);
        expect(res1.memberOfGroups).to.deep.eql(expected.memberOfGroups);
        expect(res1.politicalRelationships).to.deep.eql(expected.politicalRelationships);
        expect(res1.professionalRelationships).to.deep.eql(expected.professionalRelationships);
        expect(res1.willExecutor).to.deep.eql(expected.willExecutor);
        expect(res1.studentProfessorRelationships).to.deep.eql(expected.studentProfessorRelationships);

        expect(res1).to.deep.eql(expected);
        done();
      });
  });


});
