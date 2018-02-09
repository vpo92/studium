// @flow

import { type Prosopography } from '../../../../api/types/Prosopography';

export type ProsopographiesByKeyword = {
  keyword: string,
  prosopographies: Prosopography[],
};

export type RequestProsopographiesByKeywordAction = {
  type: 'REQUEST_PROSOPOGRAPHIES_BY_KEYWORD',
  keyword: string,
};

export type ReceiveProsopographiesByKeywordAction = {
  type: 'RECEIVE_PROSOPOGRAPHIES_BY_KEYWORD',
  prosopographiesByKeyword: ProsopographiesByKeyword,
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
