// @flow

import {
  type Search,
  type SearchAction,
} from '../../actions/Search/searchTypes';

export const search: (search: Search) => SearchAction = search => ({
  type: 'SEARCH',
  search,
});
