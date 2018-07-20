//@flow
import type {Prosopography,ProsopographyField} from '../types';
import {findProperty} from '../prop.util'

function buildProsopography(record: ProsopographyField) : Prosopography{
  let result : Prosopography = {
    reference: record.reference,
    identity:{
      name: record.name,
      nameVariant: record.nameVariant,
      shortDescription: record.shortDescription,
      datesOfLife: record.datesOfLife,
      datesOfActivity: record.datesOfActivity,
      activityMediane: record.activityMediane,
      gender: record.gender,
      status: record.status,
    },
    origin:{
      birthPlace: record.birthPlace,
      diocese: record.diocese,
      movesInOutParis: record.movesInOutParis,
    },
    relationalInsertion:{
      socialClassOrigin: record.socialClassOrigin,
      familyNetwork: record.familyNetwork,
      personalSocialClass: record.personalSocialClass,
      personalServicesRelationship: record.personalServicesRelationship,
      friends: record.friends,
      controversyOrDebates: record.controversyOrDebates,
      connectionsWith: record.connectionsWith,
      memberOfGroups: record.memberOfGroups,
      politicalRelationships: record.politicalRelationships,
      professionalRelationships: record.professionalRelationships,
      willExecutor: record.willExecutor,
      studentProfessorRelationships: record.studentProfessorRelationships,
    },
    curriculum:{
      preUniversity: record.preUniversity,
      university: record.university,
      grades: record.grades,
      universityCollege: record.universityCollege,
      collegeFundations: record.collegeFundations,
    },
    ecclesiasticalCareer:{
      ecclesiasticalStatus: record.ecclesiasticalStatus,
      secularPosition: record.secularPosition,
      benefits: record.benefits,
      regularOrder: record.regularOrder,
      regularFunctions: record.regularFunctions,
      popFunctions: record.popFunctions,
      otherFunctions: record.otherFunctions,
      communityFundations: record.communityFundations,
    },
    professionalCareer:{
      professorOrPerceptor: record.professorOrPerceptor,
      universityFunction: record.universityFunction,
      lawFunction: record.lawFunction,
      propertiesAdministrator: record.propertiesAdministrator,
      townAdministrator: record.townAdministrator,
      culturalFunction: record.culturalFunction,
      kingdowChurchFunction: record.kingdowChurchFunction,
      kingdomCulturalFunction: record.kingdomCulturalFunction,
      kingdomVariousFunction: record.kingdomVariousFunction,
      royalAdministration: record.royalAdministration,
      localAdministrationFunction: record.localAdministrationFunction,
      representation: record.representation,
      business: record.business,
      medicine: record.medicine,
      otherJob: record.otherJob,
    },

    politicalCareer:{
      importantPosition: record.importantPosition,
      jailed: record.jailed,
      violentDeath: record.violentDeath,
      exil: record.exil,
      justiceFacts: record.justiceFacts,
    },

    travels: record.travels,

    commissions:{
      universityCommission: record.universityCommission,
      otherCommission: record.otherCommission,
    },
    assets:{
      parisHousing: record.parisHousing,
      otherHousing: record.otherHousing,
      incomes: record.incomes,
      will: record.will,
      gifts: record.gifts,
    },

    distinctiveSign:{
      emblems: record.emblems,
      seals: record.seals,
    },
    orality: record.orality,
    otherActivities: record.otherActivities,

  };

  //FIXME : remove null field

  return result;
}

 function finalizeReference(record : ProsopographyField) : ProsopographyField {
   const ref = record.reference.value;
   record.reference = ref;
   return record;
};

 function finalizeGender(record : ProsopographyField) : ProsopographyField {

  if(!record.gender){
    record.gender = {
      value : "male"
    }
  }else{
    record.gender.rawValue =record.gender.value;
    record.gender.value ="female";
  }
  return record;
}

export function finalyseProsopography(record : ProsopographyField) : Prosopography {

  record = finalizeReference(record);
  record = finalizeGender(record);
  let result = buildProsopography(record)
  return result;
}
