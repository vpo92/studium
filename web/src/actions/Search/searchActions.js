// @flow

import {
  type Search,
  type Prosopography,
  type SearchAction,
  type ShowProsopographyAction,
} from '../../actions/Search/searchTypes';

export const search: (search: Search) => SearchAction = search => ({
  type: 'SEARCH',
  search,
});

export const showProsopography: Prosopography => ShowProsopographyAction = prosopography => ({
  type: 'SHOW_PROSOPOGRAPHY',
  prosopography,
});
