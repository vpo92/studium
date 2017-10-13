import React from "react";
import ReactDOM from "react-dom";
import injectTapEventPlugin from "react-tap-event-plugin";
import { Provider } from 'react-redux';
//import { ConnectedRouter as Router} from 'react-router-redux';
//import { BrowserRouter as Router} from 'react-router-dom';
import { Router} from 'react-router-dom';

import App from '../containers/App';
//import configureStore from '../store/configureStore';
import createHistory from 'history/createBrowserHistory';





//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

//const store = configureStore();
const history = createHistory();

/**
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);
*/
ReactDOM.render(
    <Router history={history}>
      <App />
    </Router>,
  document.getElementById("root")
);
