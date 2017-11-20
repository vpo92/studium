// @flow

import {
  type SearchAction,
  type Search,
} from '../../actions/Search/searchTypes';

const searchReducer = (
  state: { search: Search } = {
    search: {
      keyWord: '',
      result: [],
    },
  },
  action: SearchAction
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
    default:
      return state;
  }
};

export default searchReducer;
