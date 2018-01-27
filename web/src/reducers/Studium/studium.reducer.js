// @flow

import {
  type SearchAction,
  type ShowProsopographyAction,
  type Search,
} from '../../actions/Search/searchTypes';

import {
  type SideMenuAction,
  type ChangePageAction,
} from '../../actions/Menu/menuTypes';

type StudiumAction = SearchAction | SideMenuAction | ChangePageAction | ShowProsopographyAction;

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
    case 'SHOW_PROSOPOGRAPHY':
      return {
        ...state,
        currentItem: action.prosopography,
      }
    default:
      return state;
  }
};

export default studiumReducer;
