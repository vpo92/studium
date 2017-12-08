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

  static parseGenericData(item){
    let res = null;
    if(typeof item.data === 'string'){
      res = {"value":item.data};
    }else{
      res = item.data.content[0];
      if(UtilParser.findProperty(item,"data.pname.content"))
        res+=" "+UtilParser.parseName(item.data).value;
      res+=" "+item.data.content[1];
      if(UtilParser.findProperty(item,"data.dates.date.content"))
        res+=" "+item.data.dates.date.content;
      if(item.data.content[2] && item.data.content[2])
        res+=" "+item.data.content[2];
      res = {"value":res};
    }
    return res;
  }

  //controversyOrDebates	[SimpleInformation{...}]
  static parseControversyOrDebates(data){
    let res = null;
    if(data && data instanceof Array && data.length > 0){
      res = data.map(RelationalParser.parseGenericData);
    }
    return res;
  }

static parsePolitical(data){
  let res = null;
  if(data && data instanceof Array && data.length > 0){
    res = data.map(RelationalParser.parseGenericData);
  }
  return res
}


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

      let controversyOrDebates = UtilParser.findProperty(json,"prosop.person.relationelInsertion.polemic");
      if(controversyOrDebates){
        relationalI.controversyOrDebates = RelationalParser.parseControversyOrDebates(controversyOrDebates);
      }
      //connectionsWith	[SimpleInformation{...}] : not found

      //memberOfGroups	[SimpleInformation{...}] : not found

      //politicalRelationships	[SimpleInformation{...}]
      let politicalRelationships = UtilParser.findProperty(json,"prosop.person.relationelInsertion.politicalLinks");
      if(politicalRelationships){
        relationalI.politicalRelationships = RelationalParser.parsePolitical(politicalRelationships);
      }


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
