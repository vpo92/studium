// @flow

import { type Search } from '../../actions/Search/searchTypes';

export type State = {
  advancesearch: boolean,
  activateCompleteSearchFeature: boolean,
  search: {
    keyWord: string,
  },
};

export type Props = {
  handleKeyWordSearch: Function,
  search: Search,
  classes: any,
};
