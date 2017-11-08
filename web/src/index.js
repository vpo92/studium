import React from "react";
import ReactDOM from "react-dom";
import injectTapEventPlugin from "react-tap-event-plugin";
import { Provider } from 'react-redux';
import { ConnectedRouter as Router} from 'react-router-redux';
import App from './components/App';
import style from './main.css';
import configureStore from './store/configureStore';
import createHistory from 'history/createBrowserHistory';

//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const store = configureStore({
  search: {
    keyWord: '',
    result: [],
  },
});
const history = createHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);
