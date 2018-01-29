// @flow

type Status =
  | 'Maître'
  | 'Gradué'
  | 'Étudiant'
  | 'Suppôt'
  | 'Extérieur'
  | 'Incertain'
  | 'external';
export type Profile = {
  _id: string,
  reference: string,
  identity: {
    id: string,
    name: {
      value: string,
    },
    description?: {
      value: string,
    },
    nameVariant: [
      {
        value: string,
      },
    ],
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
    status?: {
      value: Status,
    },
    mediane?: string,
    origine?: string,
  },
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
