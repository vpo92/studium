// @flow

import {
  type SnackbarAction,
  type ReceiveApiUrlAction,
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

import {
  type LoginSuccesAction,
  type LoginFailureAction,
} from '../../actions/Login/loginTypes';

import { type Prosopography } from '../../../../api/types/Prosopography';

type StudiumAction =
  | SideMenuAction
  | SnackbarAction
  | ChangePageAction
  | ReceiveApiUrlAction
  | RequestProsopographyDetailsAction
  | ReceiveProsopographyDetailsAction
  | RequestProsopographiesByKeywordAction
  | ReceiveProsopographiesByKeywordAction
  | ReceiveProsopographiesByFirstLetterAction
  | RequestProsopographiesByFirstLetterAction
  | RequestLoginAction
  | ReceiveLoginAction
  | RequestLogoutAction
  | ReceiveLogoutAction
  | LoginSuccesAction
  | LoginFailureAction;

export type StudiumState = {
  apiUrl: string,
  showSideMenu: boolean,
  prosopographiesByKeyword: {
    keyword: string,
    searchRequest: SearchRequest,
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
  login: {
    loggedIn: boolean,
    user: any,
  },
  edition: {
    prosopography: Prosopography | null,
  },
};

export const studiumInitialState = {
  apiUrl: '',
  prosopographiesByKeyword: {
    keyword: '',
    searchRequest: {},
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
  login: {
    loggedIn:false,
    user:null,
  },
  edition: {
    prosopography: null,
  },
};

const studiumReducer = (
  state: StudiumState = studiumInitialState,
  action: StudiumAction
): StudiumState => {
  switch (action.type) {
    case 'RECEIVE_API_URL':
      return {
        ...state,
        apiUrl: action.url,
      };
    case 'REQUEST_PROSOPOGRAPHIES_BY_KEYWORD':
      return {
        ...state,
        prosopographiesByKeyword: {
          keyword: action.keyword,
          searchRequest: {},
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
    case 'REQUEST_PROSOPOGRAPHIES_BY_SEARCH':
      return {
        ...state,
        prosopographiesByKeyword: {
          keyword: '',
          searchRequest: action.searchRequest,
          prosopographies: [],
        },
      };
    case 'RECEIVE_PROSOPOGRAPHIES_BY_SEARCH':
      console.log(action);
      return {
        ...state,
        prosopographiesByKeyword: {
          keyword: '',
          searchRequest: action.prosopographiesBySearch.searchRequest,
          prosopographies: action.prosopographiesBySearch.prosopographies,
        },
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        login: {
          loggedIn: true,
          user: action.user,
        },
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...studiumInitialState,
        apiUrl : state.apiUrl,
        };
    default:
      return state;
  }
};

export default studiumReducer;
