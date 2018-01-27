// @flow

type Status = 'Maître' |
  'Gradué' |
  'Étudiant' |
  'Suppôt' |
  'Extérieur' |
  'Incertain';
export type Profile = {
  _id: string,
  reference: string,
  identity: {
    id: string,
    name: string,
    description: string,
    mediane: string,
    status: Status,
    origine: string,
  },
};

export type Prosopography = Profile;

export type Search = { keyWord: string, result: Profile[] };

export type SearchAction = {
  type: 'SEARCH',
  search: Search
};

export type ShowProsopographyAction = {
  type: 'SHOW_PROSOPOGRAPHY',
  prosopography: Prosopography,
};
