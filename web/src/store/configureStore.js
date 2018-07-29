// @flow

import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import { type StudiumState } from '../reducers/Studium/studium.reducer';
import thunkMiddleware from 'redux-thunk';

const composeFunctions = [
  applyMiddleware(thunkMiddleware),
];

const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

export default function configureStore(initialState: {
  studium: StudiumState,
}) {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(...composeFunctions)
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    // $FlowFixMe
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
