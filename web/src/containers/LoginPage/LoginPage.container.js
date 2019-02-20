// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import LoginPage from '../../components/LoginPage/LoginPage.component';
import { requestLogin } from '../../actions/Login/loginActions';

const mapStateToProps = state => {
  return {
    loggedIn: state.studium.login.loggedIn,
  };
};

const mapDispatchToProps = dispatch => ({
  handleLogin: (username: string, password: string) => {
    dispatch(requestLogin(username, password));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LoginPage)
);
