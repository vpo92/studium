import UtilParser from './util.parser';

//FIXME : check business rule
const relationType = {
  mère: 'mother',
  père: 'father',
  frère: 'brother',
  soeur: 'sister',
  sœur: 'sister',
  oncle: 'uncle',
  tante: 'aunt',
  'grand-père': 'grandfather',
  'père grand-père': 'grandfather',
  cousin: 'cousin',
  'mère fille': 'grandmother',
  fille: 'daughter',
  fils: 'son',
  femme: 'wife',
};

class RelationalParser {
  //familyNetwork
  static parseFamilyNetwork(data) {
    let res = null;
    //must be a tab
    if (data && data instanceof Array && data.length > 0) {
      res = data.map(item => {
        //data & type
        let type = relationType[item.type] ? relationType[item.type] : 'other';
        return { name: UtilParser.parseName(item.data), type };
      });
    }
    return res;
  }

  static parseRelations(data) {
    let res = null;
    if (data) {
      if (data instanceof Array && data.length > 0) {
        res = data.map(item => {
          //data
          return { name: UtilParser.parseName(item.data) };
        });
      } else {
        res = [{ name: UtilParser.parseName(data.data) }];
      }
    }
    return res;
  }

  //FIXME : Enemy ?
  static parseFriends(data) {
    let res = null;
    if (data && data !== {} && data !== []) {
      if (data instanceof Array && data.length > 0) {
        res = data.map(item => {
          //data & type
          return { name: UtilParser.parseName(item.data), type: 'friend' };
        });
      } else if (data.data) {
        res = [{ name: UtilParser.parseName(data.data), type: 'friend' }];
      }
    }
    return res;
  }

  static parseSocialClassOrigin(data) {
    let res = null;
    if (data && typeof data === 'string') {
      return { value: data };
    }
    return res;
  }

  static parseGenericDataOrArray(data) {
    let res = null;
    if (data && data instanceof Array && data.length > 0) {
      res = data.map(RelationalParser.parseGenericData);
    } else if (data) {
      res = [RelationalParser.parseGenericData(data)];
    }
    return res;
  }

  static parseGenericData(item) {
    let res = null;
    if (typeof item.data === 'string') {
      res = { value: item.data };
    } else {
      res = item.data.content[0];
      if (UtilParser.findProperty(item, 'data.pname.content')) {
        res += ` ${UtilParser.parseName(item.data).value}`;
      } else if (UtilParser.findProperty(item, 'data.ptitle.content')) {
        res += ` ${item.data.ptitle.content}`;
      }

      res += ` ${item.data.content[1]}`;
      if (UtilParser.findProperty(item, 'data.dates.date.content'))
        res += ` ${item.data.dates.date.content}`;
      if (item.data.content[2]) res += ` ${item.data.content[2]}`;
      res = { value: res };
    }
    return res;
  }

  //controversyOrDebates	[SimpleInformation{...}]
  static parseControversyOrDebates(data) {
    let res = null;
    if (data && data instanceof Array && data.length > 0) {
      res = data.map(RelationalParser.parseGenericData);
    }
    return res;
  }

  static buildRelationalInsertion(json) {
    if (json) {
      let relationalI = {};

      let familyNetwork = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.familyNetwork'
      );

      if (familyNetwork) {
        relationalI.familyNetwork = RelationalParser.parseFamilyNetwork(
          familyNetwork
        );
      }
      let socialClassOrigin = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.socialClassOrigin'
      );

      if (socialClassOrigin) {
        relationalI.socialClassOrigin = RelationalParser.parseSocialClassOrigin(
          socialClassOrigin.data
        );
      }

      let personalServicesRelationship = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.personalServiceRelationship'
      );
      if (personalServicesRelationship) {
        relationalI.personalServicesRelationship = RelationalParser.parseRelations(
          personalServicesRelationship
        );
      }

      let friends = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.friends'
      );
      if (friends) {
        relationalI.friends = RelationalParser.parseRelations(friends);
      }

      let controversyOrDebates = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.polemic'
      );
      if (controversyOrDebates) {
        relationalI.controversyOrDebates = RelationalParser.parseControversyOrDebates(
          controversyOrDebates
        );
      }
      //connectionsWith	[SimpleInformation{...}] : not found

      let connectionsWith = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.regularCorrespondence'
      );
      if (connectionsWith) {
        relationalI.connectionsWith = RelationalParser.parseGenericDataOrArray(
          connectionsWith
        );
      }

      let memberOfGroups = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.specificGroup'
      );
      if (memberOfGroups) {
        relationalI.memberOfGroups = RelationalParser.parseGenericDataOrArray(
          memberOfGroups
        );
      }

      let politicalRelationships = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.politicalLinks'
      );
      if (politicalRelationships) {
        relationalI.politicalRelationships = RelationalParser.parseGenericDataOrArray(
          politicalRelationships
        );
      }

      let professionalRelationships = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.professionalLinks'
      );
      if (professionalRelationships) {
        relationalI.professionalRelationships = RelationalParser.parseGenericDataOrArray(
          professionalRelationships
        );
      }

      let executor = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.executor'
      );
      if (executor) {
        relationalI.willExecutor = RelationalParser.parseGenericDataOrArray(
          executor
        );
      }

      let studentProfessorRelationships = UtilParser.findProperty(
        json,
        'prosop.person.relationelInsertion.student-professor'
      );
      if (studentProfessorRelationships) {
        relationalI.studentProfessorRelationships = RelationalParser.parseGenericDataOrArray(
          studentProfessorRelationships
        );
      }
      return relationalI;
    } else {
      return null;
    }
  }
}

export default RelationalParser;
