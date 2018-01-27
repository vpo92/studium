// @flow

import {
  type SearchAction,
  type GetProsopographyAction,
  type GetProsopographiesByFirstLetterAction,
  type Search,
} from '../../actions/Search/searchTypes';

import {
  type SideMenuAction,
  type ChangePageAction,
} from '../../actions/Menu/menuTypes';

type StudiumAction = SearchAction | SideMenuAction | ChangePageAction | GetProsopographyAction | GetProsopographiesByFirstLetterAction;

type StudiumStore = {
  showSideMenu: boolean,
  currentPage: string,
  search?: Search,
  currentItem?: Object,
}

const studiumReducer = (
  state: StudiumStore = {
    showSideMenu: false,
    currentPage: 'Accueil',
  },
  action: StudiumAction
) => {
  switch (action.type) {
    case 'SEARCH':
      return {
        ...state,
        search: action.search,
      };
    case 'TOGGLE_SIDE_MENU':
      return {
        ...state,
        showSideMenu: action.showSideMenu,
      };
    case 'CHANGE_PAGE':
      return {
        ...state,
        showSideMenu: false,
        currentPage: action.newPage,
      };
    case 'GET_PROSOPOGRAPHY':
      return {
        ...state,
        currentItem: action.prosopography,
      }
    case 'GET_PROSOPOGRAPHIES_BY_FIRST_LETTER':
      return {
        ...state,
        prosopographiesByFirstLetter: action.prosopographiesByFirstLetter,
      }
    default:
      return state;
  }
};

export default studiumReducer;
