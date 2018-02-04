// @flow

import { type Prosopography } from '../../../../api/types/Prosopography';

export type Search = { keyWord: string, result: Prosopography[] };

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

export type SnackbarAction = {
  type: 'SHOW_SNACKBAR',
  error: {
    status: boolean,
    message: string,
  },
};
