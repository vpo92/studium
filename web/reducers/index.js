// @flow

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import search from './Search/search.reducer';

const rootReducer = combineReducers({
  search,
  router: routerReducer
});

/** **********************
 * Exports              *
 ************************
 */
export default rootReducer;
