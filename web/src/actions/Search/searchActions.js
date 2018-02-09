// @flow

import { type Prosopography } from '../../../../api/types/Prosopography';

import {
  type Search,
  type SearchAction,
  type SnackbarAction,
  type RequestProsopographyDetailsAction,
  type ReceiveProsopographyDetailsAction,
  type ReceiveProsopographiesByFirstLetterAction,
  type RequestProsopographiesByFirstLetterAction,
} from '../../actions/Search/searchTypes';

export const search: (search: Search) => SearchAction = search => ({
  type: 'SEARCH',
  search,
});

export const requestProsopographyDetails: string => RequestProsopographyDetailsAction = reference => ({
  type: 'REQUEST_PROSOPOGRAPHY_DETAILS',
  reference,
});

export const receiveProsopographyDetails: Prosopography => ReceiveProsopographyDetailsAction = prosopography => ({
  type: 'RECEIVE_PROSOPOGRAPHY_DETAILS',
  prosopography,
});

export type ReceiveProsopographiesByFirstLetter = (
  string,
  Prosopography[]
) => ReceiveProsopographiesByFirstLetterAction;
export const receiveProsopographiesByFirstLetter: ReceiveProsopographiesByFirstLetter = (
  letter: string,
  prosopographiesByFirstLetter: Prosopography[]
) => ({
  type: 'RECEIVE_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  prosopographiesByFirstLetter: {
    letter,
    prosopographies: prosopographiesByFirstLetter,
  },
});

export type RequestProsopographiesByFirstLetter = string => RequestProsopographiesByFirstLetterAction;
export const requestProsopographiesByFirstLetter: RequestProsopographiesByFirstLetter = (
  letter: string
) => ({
  type: 'REQUEST_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  letter,
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
