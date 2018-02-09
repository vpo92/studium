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

type StudiumStore = {
  showSideMenu: boolean,
  prosopographiesByKeyword?: Object,
  prosopographyDetails?: Object,
};

const studiumReducer = (
  state: StudiumStore = {
    showSideMenu: false,
  },
  action: StudiumAction
) => {
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
          reference: action.reference,
        },
      };
    case 'RECEIVE_PROSOPOGRAPHY_DETAILS':
      return {
        ...state,
        prosopographyDetails: action.prosopography,
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
