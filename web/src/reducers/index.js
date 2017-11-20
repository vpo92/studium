// @flow

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import studium from './Studium/studium.reducer';

const rootReducer = combineReducers({
  studium,
  router: routerReducer,
});

/** **********************
 * Exports              *
 ************************
 */
export default rootReducer;
