// @flow

export type Metadata = {
  source: string,
  comment: string,
  link: string,
  certain: boolean
}

export type SimpleInformation = {
  value: string,
  metadata: Metadata
}

export type Profile = {
  _id: string,
  reference: string,
  identity: {
    id: string,
    name: SimpleInformation,
    description: SimpleInformation,
    nameVariant: [SimpleInformation],
    datesOfLife: {
      from: string,
      to: string,
    },
    datesOfActivity: {
      from: string,
      to: string,
    },
    gender?: {
      value: 'male' | 'female',
    },
    status: SimpleInformation,
    mediane: SimpleInformation,
    origine: SimpleInformation,
  },
  origin: {
    birthPlace: SimpleInformation,
     diosese: SimpleInformation,
     movesInOutParis: [],
  },
  relationalInsertion: {
      socialClassOrigin: SimpleInformation,
      familyNetwork: [],
      personalSocialClass: SimpleInformation,
      personalServicesRelationship: [],
      friendsOrEnemies: [],
      controversyOrDebates: [],
      connectionsWith: [],
      memberOfGroups: [],
      politicalRelationships: [],
      professionalRelationships: [],
      willExecutor: SimpleInformation,
      studentProfessorRelationships: []
  }
};

export type Prosopography = Profile;

export type Search = { keyWord: string, result: Profile[] };

export type SearchAction = {
  type: 'SEARCH',
  search: Search,
};

export type GetProsopographyAction = {
  type: 'GET_PROSOPOGRAPHY_DETAILS',
  prosopography: Prosopography,
};

export type GetProsopographiesByFirstLetterAction = {
  type: 'GET_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  prosopographiesByFirstLetter: {
    letter: string,
    prosopographies: Prosopography[],
  },
};
