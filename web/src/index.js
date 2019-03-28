// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter as Router } from 'react-router-redux';
import App from './containers/App.container';
import './main.css';
import configureStore from './store/configureStore';
import createHistory from 'history/createBrowserHistory';
import {
  studiumInitialState,
  type StudiumState,
} from './reducers/Studium/studium.reducer';

//Needed for React Developer Tools
window.React = React;

export type State = {
  studium: StudiumState,
};

let user = localStorage.getItem('user')

//load user from localStorage
const initialState = (user)?
  ({studium :{
    ...studiumInitialState,
    login : {
      loggedIn: true,
      user: JSON.parse(user),
    },
  }})
:
({
  studium: studiumInitialState,
});

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
