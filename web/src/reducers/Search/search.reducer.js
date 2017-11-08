// @flow

import {
  type SearchAction,
  type Search,
} from '../../actions/Search/searchTypes';

type SearchActions = SearchAction;

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
      return action.search;
    default:
      return state;
  }
};

export default searchReducer;
