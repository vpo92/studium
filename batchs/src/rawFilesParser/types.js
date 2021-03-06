// @flow

export type DateType = 'SIMPLE' | 'INTERVAL';

export type DateInformation = {
  type: DateType,
  startDate?: SimpleDateInformation,
  endDate?: SimpleDateInformation,
}

export type SimpleDateInformation = {
  value: Date,
  certain: boolean,
  comment?: string,
  link?: string,
}

export type MetaInformation = {
  dates: any,
  names: any,
  places: any,
  titles: any,
  institutions: any,
}

export type ProsopographyInformation = {
  value: string,
  meta: MetaInformation,
  reference: any,
  comment: any,
}

export type SimpleInformation = {
  value: string,
  certain: boolean,
  comment: string,
  link: string,
}

export type ProsopographyRow = {
  reference: any,
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
  manyFields: any,
  religion: any,
  philosophy: any,
  philosophyExtended: any,
  science: any,
  medicine: any,
  litterature: any,
  justice: any,
  pratical: any,
  music: any,
  administrativePractice: any,
  history: any,
  political: any,
  discussedMusical: any,
  discussedManyFields: any,
  discussedReligion: any,
  discussedPhilosophy: any,
  discussedPhilosophyExtended: any,
  discussedMedicine: any,
  discussedScience: any,
  discussedLitterature: any,
  discussedJustice: any,
  discussedPratical: any,
  discussedHistory: any,
  discussedPolitical: any,
  title: string,
  link: string,
  raw: any,
  bookOwner: any,
  workSources: any,
  workReferences: any,
  bookReferences: any,
  otherBases: any,

}


export type Prosopography = {
  reference: string,
  identity: {
    name: ProsopographyInformation,
    nameVariant: [ProsopographyInformation],
    shortDescription: ProsopographyInformation,
    datesOfLife: any,
    datesOfActivity: any,
    activityMediane: any,
    gender: ProsopographyInformation,
    status: ProsopographyInformation,
  },
  origin: {
    birthPlace: any,
    diocese: any,
    movesInOutParis: any,
  },
  relationalInsertion: {
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
  curriculum: {
    preUniversity: any,
    university: any,
    grades: any,
    universityCollege: any,
    collegeFundations: any,
  },
  ecclesiasticalCareer: {
    ecclesiasticalStatus: any,
    secularPosition: any,
    benefits: any,
    regularOrder: any,
    regularFunctions: any,
    popFunctions: any,
    otherFunctions: any,
    communityFundations: any,
  },
  professionalCareer: {
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

  politicalCareer: {
    importantPosition: any,
    jailed: any,
    violentDeath: any,
    exil: any,
    justiceFacts: any,
  },


  travels: {
    travels: any,
  },

  commissions: {
    universityCommission: any,
    otherCommission: any,
  },
  assets: {
    parisHousing: any,
    otherHousing: any,
    incomes: any,
    will: any,
    gifts: any,
  },

  distinctiveSign: {
    emblems: any,
    seals: any,
  },
  orality: {
    orality: any,
  },
  otherActivities: {
    otherActivities: any
  },
  textualProduction: {
    manyFields: any,
    religion: any,
    philosophy: any,
    philosophyExtended: any,
    science: any,
    medicine: any,
    litterature: any,
    justice: any,
    pratical: any,
    music: any,
    administrativePractice: any,
    history: any,
    political: any,
    discussedMusical: any,
    discussedManyFields: any,
    discussedReligion: any,
    discussedPhilosophy: any,
    discussedPhilosophyExtended: any,
    discussedMedicine: any,
    discussedScience: any,
    discussedLitterature: any,
    discussedJustice: any,
    discussedPratical: any,
    discussedHistory: any,
    discussedPolitical: any,
  },
  bibliography: {
    workSources: any,
    workReferences: any,
    bookReferences: any,
    otherBases: any,
  },
  library: any,
  title: string,
  link: string,
  extras: any,
  raw: any,
}

export type ville = {
  ville: any,
  pays: any,
  xl93: any,
  yl93: any,
  xwgs84: any,
  ywgs84: any,
  data_base: any
}

export type manuscrit = {
  idbdd: any,
  places: any,
  cote: any
}

export type Line = 'BIBLIOGRAPHY_START' | 'DATA' | 'EMPTY' | 'ERROR' | 'FIRST_LINE';

export type ParsedLine = { type: Line, value?: $Shape<ProsopographyRow> };

export type SaveRecordFunction = (record: Prosopography) => Promise<void>;
