// @flow

type Metadata = {
  source: string,
  comment: string,
  link: string,
  certain: boolean,
};

type SimpleInformation = {
  value: string,
  metadata?: Metadata,
};

export type ProsopographyIdentity = {
  id?: string,
  name: SimpleInformation,
  description: SimpleInformation,
  nameVariant: [SimpleInformation],
  datesOfLife?: {
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
  mediane?: SimpleInformation,
  origine?: SimpleInformation,
};

export type Prosopography = {
  _id: string,
  reference: number,
  identity: ProsopographyIdentity,
  origin?: {
    birthPlace: SimpleInformation,
    diosese: SimpleInformation,
    movesInOutParis: [],
  },
  relationalInsertion?: {
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
    studentProfessorRelationships: [],
  },
};
