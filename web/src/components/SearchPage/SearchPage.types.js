// @flow

import { type Search } from '../../actions/Search/searchTypes';

export type State = {
  status: number,
  grade: number,
  discipline: number,
  advancesearch: boolean,
  activateCompleteSearchFeature: boolean,
  search: {
    keyWord: string,
  }
}

export type Props = {
  handleKeyWordSearch: Function,
  search: Search,
  classes: any,
}
