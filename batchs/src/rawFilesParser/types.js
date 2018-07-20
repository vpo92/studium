// @flow

export type MetaData = {
  certain: ?boolean,
  comment: ?string,
  link: ?string,
}

export type DateType = 'SIMPLE' | 'INTERVAL';

export type DateInformation = {
  type: DateType,
  startDate: ?SimpleDateInformation,
  endDate: ?SimpleDateInformation,
}

export type SimpleDateInformation = {
  value: Date,
  certain: boolean,
  comment: string,
  link: string,
}

export type SimpleInformation = {
  value: string,
  certain: boolean,
  comment: string,
  link: string,
}

export type ProsopographyField = {
  reference: string,
  name: any,
  nameVariant: any,
  shortDescription: any,
  datesOfLife: any,
  datesOfActivity: any,
  activityMediane: any,
  gender: any,
  status: any,
  birthPlace: any,
  diocese: any,
  movesInOutParis: any,
  socialClassOrigin: any,
  familyNetwork: any,
  personalSocialClass: any,
  personalServicesRelationship: any,
  friends: any,
  controversyOrDebates: any,
  connectionsWith: any,
  memberOfGroups: any,
  politicalRelationships: any,
  professionalRelationships: any,
  willExecutor: any,
  studentProfessorRelationships: any,
  preUniversity: any,
  university: any,
  grades: any,
  universityCollege: any,
  collegeFundations: any,
  ecclesiasticalStatus: any,
  secularPosition: any,
  benefits: any,
  regularOrder: any,
  regularFunctions: any,
  popFunctions: any,
  otherFunctions: any,
  communityFundations: any,
  professorOrPerceptor: any,
  universityFunction: any,
  lawFunction: any,
  propertiesAdministrator: any,
  townAdministrator: any,
  culturalFunction: any,
  kingdowChurchFunction: any,
  kingdomCulturalFunction: any,
  kingdomVariousFunction: any,
  royalAdministration: any,
  localAdministrationFunction: any,
  representation: any,
  business: any,
  medicine: any,
  otherJob: any,
  importantPosition: any,
  jailed: any,
  violentDeath: any,
  exil: any,
  justiceFacts: any,
  travels: any,
  universityCommission: any,
  otherCommission: any,
  parisHousing: any,
  otherHousing: any,
  incomes: any,
  will: any,
  gifts: any,
  emblems: any,
  seals: any,
  orality: any,
  otherActivities: any,
}


export type Prosopography = {
  reference: string,
  identity:{
    name: any,
    nameVariant: any,
    shortDescription: any,
    datesOfLife: any,
    datesOfActivity: any,
    activityMediane: any,
    gender: any,
    status: any,
  },
  origin:{
    birthPlace: any,
    diocese: any,
    movesInOutParis: any,
  },
  relationalInsertion:{
    socialClassOrigin: any,
    familyNetwork: any,
    personalSocialClass: any,
    personalServicesRelationship: any,
    friends: any,
    controversyOrDebates: any,
    connectionsWith: any,
    memberOfGroups: any,
    politicalRelationships: any,
    professionalRelationships: any,
    willExecutor: any,
    studentProfessorRelationships: any,
  },
  curriculum:{
    preUniversity: any,
    university: any,
    grades: any,
    universityCollege: any,
    collegeFundations: any,
  },
  ecclesiasticalCareer:{
    ecclesiasticalStatus: any,
    secularPosition: any,
    benefits: any,
    regularOrder: any,
    regularFunctions: any,
    popFunctions: any,
    otherFunctions: any,
    communityFundations: any,
  },
  professionalCareer:{
    professorOrPerceptor: any,
    universityFunction: any,
    lawFunction: any,
    propertiesAdministrator: any,
    townAdministrator: any,
    culturalFunction: any,
    kingdowChurchFunction: any,
    kingdomCulturalFunction: any,
    kingdomVariousFunction: any,
    royalAdministration: any,
    localAdministrationFunction: any,
    representation: any,
    business: any,
    medicine: any,
    otherJob: any,
  },

  politicalCareer:{
    importantPosition: any,
    jailed: any,
    violentDeath: any,
    exil: any,
    justiceFacts: any,
  },


  travels: any,

  commissions:{
    universityCommission: any,
    otherCommission: any,
  },
  assets:{
    parisHousing: any,
    otherHousing: any,
    incomes: any,
    will: any,
    gifts: any,
  },

  distinctiveSign:{
    emblems: any,
    seals: any,
  },
  orality: any,
  otherActivities: any,
}

export type Line = 'BIBLIOGRAPHY_START' | 'DATA' | 'EMPTY' | 'ERROR';

export type ParsedLine = { type: Line, value?: $Shape<ProsopographyField> };

export type SaveRecordFunction = (record: Prosopography) => Promise<void>;
