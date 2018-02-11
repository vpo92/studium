// @flow

import {
  type SnackbarAction,
  type RequestProsopographiesByKeywordAction,
  type ReceiveProsopographiesByKeywordAction,
  type RequestProsopographyDetailsAction,
  type ReceiveProsopographyDetailsAction,
  type ReceiveProsopographiesByFirstLetterAction,
  type RequestProsopographiesByFirstLetterAction,
} from '../../actions/Search/searchTypes';

import {
  type SideMenuAction,
  type ChangePageAction,
} from '../../actions/Menu/menuTypes';

import { type Prosopography } from '../../../../api/types/Prosopography';

type StudiumAction =
  | SideMenuAction
  | SnackbarAction
  | ChangePageAction
  | RequestProsopographyDetailsAction
  | ReceiveProsopographyDetailsAction
  | RequestProsopographiesByKeywordAction
  | ReceiveProsopographiesByKeywordAction
  | ReceiveProsopographiesByFirstLetterAction
  | RequestProsopographiesByFirstLetterAction;

export type StudiumStore = {
  showSideMenu: boolean,
  prosopographiesByKeyword: {
    keyword: string,
    prosopographies: Prosopography[],
  },
  prosopographyDetails: {
    prosopography: Prosopography | null,
  },
  prosopographiesByFirstLetter: {
    letter: string,
    prosopographies: Prosopography[],
  },
  error: {
    status: boolean,
    message?: string,
  },
};

export const studiumInitialState = {
  prosopographiesByKeyword: {
    keyword: '',
    prosopographies: [],
  },
  prosopographyDetails: {
    prosopography: null,
  },
  prosopographiesByFirstLetter: {
    letter: '',
    prosopographies: [],
  },
  error: {
    status: false,
  },
  showSideMenu: false,
};

const studiumReducer = (
  state: StudiumStore = studiumInitialState,
  action: StudiumAction
): StudiumStore => {
  switch (action.type) {
    case 'REQUEST_PROSOPOGRAPHIES_BY_KEYWORD':
      return {
        ...state,
        prosopographiesByKeyword: {
          keyword: action.keyword,
          prosopographies: [],
        },
      };
    case 'RECEIVE_PROSOPOGRAPHIES_BY_KEYWORD':
      return {
        ...state,
        prosopographiesByKeyword: action.prosopographiesByKeyword,
      };
    case 'SHOW_SIDE_MENU':
      return {
        ...state,
        showSideMenu: action.showSideMenu,
      };
    case 'SHOW_SNACKBAR':
      return {
        ...state,
        error: {
          message: action.error.message,
          status: action.error.status,
        },
      };
    case 'CHANGE_PAGE':
      return {
        ...state,
        showSideMenu: false,
      };
    case 'REQUEST_PROSOPOGRAPHY_DETAILS':
      return {
        ...state,
        prosopographyDetails: {
          prosopography: null,
        },
      };
    case 'RECEIVE_PROSOPOGRAPHY_DETAILS':
      return {
        ...state,
        prosopographyDetails: {
          prosopography: action.prosopography,
        },
      };
    case 'REQUEST_PROSOPOGRAPHIES_BY_FIRST_LETTER':
      return {
        ...state,
        prosopographiesByFirstLetter: {
          letter: action.letter,
          prosopographies: [],
        },
      };
    case 'RECEIVE_PROSOPOGRAPHIES_BY_FIRST_LETTER':
      return {
        ...state,
        prosopographiesByFirstLetter: action.prosopographiesByFirstLetter,
      };
    default:
      return state;
  }
};

export default studiumReducer;
