// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import EditPage from '../../components/EditPage/EditPage.component';
import { createProsopography } from '../../actions/editActions';

const mapStateToProps = state => {
  return {
    loggedIn: state.studium.login.loggedIn,
  };
};

const mapDispatchToProps = dispatch => ({
  handleSave: (inputTxt: string) => {
    dispatch(createProsopography(inputTxt));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditPage)
);
