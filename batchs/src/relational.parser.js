const UtilParser = require('./util.parser');

/**

RelationalInsertion{
socialClassOrigin	SimpleInformation{...}
familyNetwork	[
Family Network

{
name	string
reference	integer
type	string
Enum:
[ father, sister, brother, mother, other ]
metadata	Metadata{...}
}]
personalSocialClass	SimpleInformation{...}
personalServicesRelationship	[

SimpleInformation{...}]
friendsOrEnemies	[
Known enemies and friends

{
value	string
type	string
Enum:
[ friend, enemy ]
metadata	Metadata{...}
}]
controversyOrDebates	[SimpleInformation{...}]
connectionsWith	[SimpleInformation{...}]
memberOfGroups	[SimpleInformation{...}]
politicalRelationships	[SimpleInformation{...}]
professionalRelationships	[SimpleInformation{...}]
willExecutor	SimpleInformation{...}
studentProfessorRelationships	[

{
value	string
type	string
Enum:
[ student, professor ]
metadata	Metadata{...}
}]
}

*/

//FIXME : check business rule
const relationType = {
  "mère" : "mother",
  "père" : "father",
  "frère" : "brother",
  "soeur" : "sister",
  "sœur" : "sister",
  "oncle" : "uncle",
  "tante" : "aunt",
  "grand-père" : "grandfather",
  "père grand-père" : "grandfather",
  "cousin" : "cousin",
  "mère fille" : "grandmother",
};

class RelationalParser{



  //familyNetwork
  static parseFamilyNetwork(data){
    let res = null;
    //must be a tab
    if(data && data instanceof Array && data.length > 0){
      res = data.map(item => {
        //data & type
        let type = relationType[item.type]?relationType[item.type]:"other";
        return ({"name":UtilParser.parseName(item.data),"type":type});
      });
    }
    return res;
  }

  static parseRelations(data){
    let res = null;
    //must be a tab
    if(data){
      if(data instanceof Array && data.length > 0){
        res = data.map(item => {
          //data
          return ({"name":UtilParser.parseName(item.data)});
        });
      }else{
        res = [{"name":UtilParser.parseName(data.data)}];
      }
    }
    return res;
  }

  static parseFriends(data){
    let res = null;
    //must be a tab
    if(data && data instanceof Array && data.length > 0){
      res = data.map(item => {
        //data & type
        let type = relationType[item.type]?relationType[item.type]:"other";
        return ({"name":UtilParser.parseName(item.data),"type":"friend"});
      });
    }
    return res;
  }


  //socialClassOrigin
  static parseSocialClassOrigin(data){
    let res = null;
    if(data && typeof data === 'string'){
      return {"value":data};
    }
    return res;

  }

  //friends

//"relationelInsertion" part


  static buildRelationalInsertion(json){
    if(json){
      let relationalI = {};

      let familyNetwork = UtilParser.findProperty(json,"prosop.person.relationelInsertion.familyNetwork");

      if(familyNetwork){
        relationalI.familyNetwork = RelationalParser.parseFamilyNetwork(familyNetwork);
      }
      let socialClassOrigin = UtilParser.findProperty(json,"prosop.person.relationelInsertion.socialClassOrigin");

      if(socialClassOrigin){
        relationalI.socialClassOrigin = RelationalParser.parseSocialClassOrigin(socialClassOrigin.data);;
      }

      let personalServicesRelationship = UtilParser.findProperty(json,"prosop.person.relationelInsertion.personalServicesRelationship");
      if(personalServicesRelationship){
        relationalI.personalServicesRelationship = RelationalParser.parseRelations(personalServicesRelationship);
      }

      let friends = UtilParser.findProperty(json,"prosop.person.relationelInsertion.friends");
      if(friends){
        relationalI.friends = RelationalParser.parseFriends(friends);
      }

      //controversyOrDebates	[SimpleInformation{...}]

      //connectionsWith	[SimpleInformation{...}]

      //memberOfGroups	[SimpleInformation{...}]

      //politicalRelationships	[SimpleInformation{...}]

      //professionalRelationships	[SimpleInformation{...}]

      //willExecutor	SimpleInformation{...}

      //studentProfessorRelationships


      return relationalI;
    }else{
      return null;
    }
  }

}

module.exports = RelationalParser;
