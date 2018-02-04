// @flow

import { type Prosopography } from '../../../../api/types/Prosopography';

import {
  type Search,
  type SearchAction,
  type SnackbarAction,
  type GetProsopographyAction,
  type GetProsopographiesByFirstLetterAction,
} from '../../actions/Search/searchTypes';

export const search: (search: Search) => SearchAction = search => ({
  type: 'SEARCH',
  search,
});

export const getProsopographyDetails: Prosopography => GetProsopographyAction = prosopography => ({
  type: 'GET_PROSOPOGRAPHY_DETAILS',
  prosopography,
});

export const getProsopographiesByFirstLetter: (
  string,
  Prosopography[]
) => GetProsopographiesByFirstLetterAction = (
  letter: string,
  prosopographiesByFirstLetter: Prosopography[]
) => ({
  type: 'GET_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  prosopographiesByFirstLetter: {
    letter,
    prosopographies: prosopographiesByFirstLetter,
  },
});

export type ShowSnackbar = (
  showSnackbar: boolean,
  message: string
) => SnackbarAction;
export const showSnackbar: ShowSnackbar = (status, message) => ({
  type: 'SHOW_SNACKBAR',
  error: {
    status,
    message,
  },
});
