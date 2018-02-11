// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import App from '../components/App.component';
import { fetchApiUrl } from '../services/searchAPIService';

const mapDispatchToProps = dispatch => ({
  getApiUrl: () => {
    return dispatch(fetchApiUrl());
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(connect(null, mapDispatchToProps)(App));
