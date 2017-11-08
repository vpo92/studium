// @flow

import {
  type Profile,
  type Search,
  type SearchAction,
} from '../../actions/Search/searchTypes';

export const search: (search: Search) => SearchAction = search => ({
  type: 'SEARCH',
  search,
});
