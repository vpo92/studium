// @flow

import { type ProsopographiesByKeyword } from '../../actions/Search/searchTypes';

export type State = {
  advancesearch: boolean,
  activateCompleteSearchFeature: boolean,
  search: {
    keyword: string,
  },
};

export type Props = {
  handleKeywordSearch: Function,
  search: ProsopographiesByKeyword,
  classes: any,
};
