// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter as Router } from 'react-router-redux';
import App from './components/App';
import './main.css';
import configureStore from './store/configureStore';
import createHistory from 'history/createHashHistory';
import { studiumInitialState } from './reducers/Studium/studium.reducer';

//Needed for React Developer Tools
window.React = React;

const initialState = {
  studium: studiumInitialState,
};

const store = configureStore(initialState);
const history = createHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  // $FlowFixMe
  document.getElementById('root')
);

export default {
  initialState,
};
