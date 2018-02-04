// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Snackbar from '../../components/Snackbar/Snackbar.component';
import { showSnackbar } from '../../actions/Search/searchActions';

const mapStateToProps = (state) => {
  const errorStatus = state.studium.error.status;
  return {
    message: errorStatus ? state.studium.error.message : null,
    open: errorStatus,
  };
};

const mapDispatchToProps = dispatch => ({
  showSnackbar: () => {
    return dispatch(showSnackbar(false, ''));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Snackbar)
);
