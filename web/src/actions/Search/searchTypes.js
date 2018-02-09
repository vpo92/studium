// @flow

import { type Prosopography } from '../../../../api/types/Prosopography';

export type Search = { keyWord: string, result: Prosopography[] };

export type SearchAction = {
  type: 'SEARCH',
  search: Search,
};

export type RequestProsopographyDetailsAction = {
  type: 'REQUEST_PROSOPOGRAPHY_DETAILS',
  reference: string,
};

export type ReceiveProsopographyDetailsAction = {
  type: 'RECEIVE_PROSOPOGRAPHY_DETAILS',
  prosopography: Prosopography,
};

export type RequestProsopographiesByFirstLetterAction = {
  type: 'REQUEST_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  letter: string,
};

export type ReceiveProsopographiesByFirstLetterAction = {
  type: 'RECEIVE_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  prosopographiesByFirstLetter: {
    letter: string,
    prosopographies: Prosopography[],
  },
};

export type SnackbarAction = {
  type: 'SHOW_SNACKBAR',
  error: {
    status: boolean,
    message: string,
  },
};
