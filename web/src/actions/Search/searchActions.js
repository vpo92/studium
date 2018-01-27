// @flow

import {
  type Search,
  type Prosopography,
  type SearchAction,
  type GetProsopographyAction,
  type GetProsopographiesByFirstLetterAction,
} from '../../actions/Search/searchTypes';

export const search: (search: Search) => SearchAction = search => ({
  type: 'SEARCH',
  search,
});

export const getProsopography: Prosopography => GetProsopographyAction = prosopography => ({
  type: 'GET_PROSOPOGRAPHY',
  prosopography,
});

export const getProsopographiesByFirstLetter: (string, Prosopography[]) => GetProsopographiesByFirstLetterAction = (letter: string, prosopographiesByFirstLetter: Prosopography[]) => ({
  type: 'GET_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  prosopographiesByFirstLetter: {
    letter,
    prosopographies: prosopographiesByFirstLetter,
  },
});
