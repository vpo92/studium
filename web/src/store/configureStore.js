import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import thunkMiddleware from 'redux-thunk';

const composeFunctions = [
  applyMiddleware(thunkMiddleware),
  ...(process.env.NODE_ENV !== 'production'
    ? [
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__(),
      ]
    : []),
];

export default function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    compose(...composeFunctions)
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
