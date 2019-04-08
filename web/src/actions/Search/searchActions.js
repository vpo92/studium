// @flow

import type { Prosopography } from '../../../../api/types/Prosopography';
import type { SearchRequest } from '../../../../api/types/SearchRequest';

import {
  type SnackbarAction,
  type RequestApiUrlAction,
  type ReceiveApiUrlAction,
  type RequestProsopographiesByKeywordAction,
  type ReceiveProsopographiesByKeywordAction,
  type RequestProsopographyDetailsAction,
  type ReceiveProsopographyDetailsAction,
  type ReceiveProsopographiesByFirstLetterAction,
  type RequestProsopographiesByFirstLetterAction,
} from '../../actions/Search/searchTypes';

export const requestApiUrl: () => RequestApiUrlAction = () => ({
  type: 'REQUEST_API_URL',
});

export const receiveApiUrl: string => ReceiveApiUrlAction = (url: string) => ({
  type: 'RECEIVE_API_URL',
  url,
});

export const requestProsopographiesByKeyword: string => RequestProsopographiesByKeywordAction = keyword => ({
  type: 'REQUEST_PROSOPOGRAPHIES_BY_KEYWORD',
  keyword,
});

export const receiveProsopographiesByKeyword: (
  string,
  Prosopography[]
) => ReceiveProsopographiesByKeywordAction = (keyword, prosopographies) => ({
  type: 'RECEIVE_PROSOPOGRAPHIES_BY_KEYWORD',
  prosopographiesByKeyword: {
    keyword,
    prosopographies,
  },
});

export const requestProsopographyDetails: string => RequestProsopographyDetailsAction = reference => ({
  type: 'REQUEST_PROSOPOGRAPHY_DETAILS',
  reference,
});

export const receiveProsopographyDetails: Prosopography => ReceiveProsopographyDetailsAction = prosopography => ({
  type: 'RECEIVE_PROSOPOGRAPHY_DETAILS',
  prosopography,
});

export type RequestProsopographiesByFirstLetter = string => RequestProsopographiesByFirstLetterAction;
export const requestProsopographiesByFirstLetter: RequestProsopographiesByFirstLetter = (
  letter: string
) => ({
  type: 'REQUEST_PROSOPOGRAPHIES_BY_FIRST_LETTER',
  letter,
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

// ADVANCE SEARCH PART

export type RequestProsopographiesBySearchAction = {
  type: 'REQUEST_PROSOPOGRAPHIES_BY_SEARCH',
  prosopographiesBySearch: {
    searchRequest: SearchRequest
  },
};

export type RequestProsopographiesBySearchType = (
  SearchRequest
) => RequestProsopographiesBySearchAction;

export const requestProsopographiesBySearch: RequestProsopographiesBySearchType = (
  searchRequest: SearchRequest
) => ({
  type: 'REQUEST_PROSOPOGRAPHIES_BY_SEARCH',
  prosopographiesBySearch: {
    searchRequest: searchRequest,
  },
});


export type ReceiveProsopographiesBySearchAction = {
  type: 'RECEIVE_PROSOPOGRAPHIES_BY_SEARCH',
  prosopographiesBySearch: {
    searchRequest: SearchRequest,
    prosopographies: Prosopography[],
  },
};

export type ReceiveProsopographiesBySearchType = (
  SearchRequest,
  Prosopography[]
) => ReceiveProsopographiesBySearchAction;


export const receiveProsopographiesBySearch: (
  searchRequest: SearchRequest,
  prosopographies: Prosopography[]
) => ReceiveProsopographiesBySearchAction = (searchRequest, prosopographies) => ({
  type: 'RECEIVE_PROSOPOGRAPHIES_BY_SEARCH',
  prosopographiesBySearch: {
    searchRequest,
    prosopographies,
  },
});
