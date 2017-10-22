// @flow

type Status = 'Maître' |
  'Gradué' |
  'Étudiant' |
  'Suppôt' |
  'Extérieur' |
  'Incertain';
type Grade = 'Magister' |
  'Docteur' |
  'Maître' |
  'Licencié' |
  'Bachelier' |
  'Étudiant';
export type Profile = {
  id: string,
  name: string,
  mediane: string,
  status: Status,
  origine: string
};
export type Search = { keyWord: string, result: Profile[] };

export type SearchAction = {
  type: 'SEARCH',
  search: Search
};
