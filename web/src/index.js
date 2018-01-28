import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter as Router } from 'react-router-redux';
import App from './components/App';
// eslint-disable-next-line no-unused-vars
import style from './main.css';
import configureStore from './store/configureStore';
import createHistory from 'history/createHashHistory';

//Needed for React Developer Tools
window.React = React;

const store = configureStore({
  studium: {
    search: {
      keyWord: '',
      result: [],
    },
    showSideMenu: false,
    currentPageTitle: 'Accueil',
  },
});
const history = createHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
