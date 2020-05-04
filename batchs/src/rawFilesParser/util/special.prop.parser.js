//@flow
import type {Prosopography,ProsopographyRow} from '../types';
import {parseMS} from './ms.parser';

function buildProsopography(record: ProsopographyRow): Prosopography{
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

    travels:{
      travels: record.travels,
    },

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
    orality:{
      orality: record.orality,
    },
    otherActivities:{
      otherActivities: record.otherActivities,
    },
    textualProduction:{
      manyFields	:	record.manyFields,
      religion	:	record.religion,
      philosophy	:	record.philosophy,
      philosophyExtended	:	record.philosophyExtended,
      science	:	record.science,
      medicine	:	record.medicine,
      litterature	:	record.litterature,
      justice	:	record.justice,
      pratical	:	record.pratical,
      music	:	record.musical,
      administrativePractice	:	record.administrativePractice,
      history	:	record.history,
      political	:	record.political,
      discussedMusical	:	record.discussedMusical,
      discussedManyFields	:	record.discussedManyFields,
      discussedReligion	:	record.discussedReligion,
      discussedPhilosophy	:	record.discussedPhilosophy,
      discussedPhilosophyExtended	:	record.discussedPhilosophyExtended,
      discussedMedicine	:	record.discussedMedicine,
      discussedScience	:	record.discussedScience,
      discussedLitterature	:	record.discussedLitterature,
      discussedJustice	:	record.discussedJustice,
      discussedPratical	:	record.discussedPratical,
      discussedHistory	:	record.discussedHistory,
      discussedPolitical	:	record.discussedPolitical,
    },
    bibliography:{
      workSources : record.workSources,
      workReferences : record.workReferences,
      bookReferences : record.bookReferences,
      otherBases : record.otherBases,
    },
    title: record.title,
    link: record.link,
    raw : record.raw,
  };

  //FIXME : remove null field

  return result;
}

 function finalizeReference(record: ProsopographyRow): ProsopographyRow {

   const ref = record.reference[0].value;
   record.reference = ref.trim();
   return record;
}

 function finalizeGender(record: ProsopographyRow): ProsopographyRow {

  if(!record.gender){
    record.gender = [
      {
      value : "male",
      meta:{
        isComment: false,
        isLink: false},
      },
      ];
  }else{
    record.gender.rawValue =record.gender.value;
    record.gender=[
      {
      value : "female",
      meta:{
        isComment: false,
        isLink: false},
      },
      ];
  }
  return record;
}

function finalizeTitle(record: ProsopographyRow): ProsopographyRow{
  if(record.name){
    record.title = record.name instanceof Array? record.name[0].value: record.name.value;
  }else{
    record.title = '';
  }
  return record;
}

function finalizeLink(record: ProsopographyRow): ProsopographyRow{
  let title = record.title.split(' ').join('').toLowerCase();
  record.link = "/individus/"+record.reference+"-"+title;
  return record;
}

export function finalyzeOpus(opus: any){
  if(opus && opus.title){
    let s = new String(opus.title[0].value);
    opus.mainTitle = s.replace(/[()&]/g, '');
  }
  if(opus && opus.manuscrits && opus.manuscrits.length > 0){
    for(let i = 0; i < opus.manuscrits.length; i++){
      let d = parseMS(opus.manuscrits[i].value);
      if(d){
        opus.manuscrits[i].meta.manuscrit = d;
      }

    }
  }
  return opus;
}

function finalyzeTextualProduction(record){
  if(record.textualProduction){
    //console.log(JSON.stringify(record.textualProduction));
    let txtPrd = record.textualProduction;
    let res = {};
    Object.keys(txtPrd).forEach( (key) => {
      let opusType = txtPrd[key];
      //Si Opus
      if(opusType && opusType[0] && opusType[0].opus){
        res[key] = {
          value:opusType[0].value,
          meta:opusType[0].meta,
          opus:opusType[0].opus
        }
      //Sinon on ignore
      }else{
        //console.log(`ERROR in finalyzeTextualProduction for ${opusType}`);
        //console.log(`ERROR in finalyzeTextualProduction for ${opusType[0]}`);
        //console.log(`ERROR in finalyzeTextualProduction for ${opusType[0].opus}`);
        //throw new Error(`ERROR in finalyzeTextualProduction for ${opusType}`);

      }
    });
    record.textualProduction = res;
  }
  return record;
}

export function finalyzeProsopography(record: ProsopographyRow): Prosopography {
  if(record.reference){

    record = finalizeReference(record);
    record = finalizeGender(record);
    record = finalizeTitle(record);
    record = finalizeLink(record);


    let result = buildProsopography(record);
    result = JSON.parse(JSON.stringify(result));

    result = finalyzeTextualProduction(result);


    //remove empty
    Object.keys(result).forEach( (key) => {
      if(Object.keys(result[key]).length <= 0){
        delete result[key]
      }
    });

    //FIXME clean all meta

    return result;
  }
  return null;



}
