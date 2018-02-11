// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import DetailsPage from '../../components/DetailsPage/DetailsPage.component';
import { fetchProsopographyByReference } from '../../services/searchAPIService';

const mapStateToProps = (state, ownProps) => {
  const paths = ownProps.location.pathname.split('/');
  return {
    prosopography: state.studium.prosopographyDetails.prosopography,
    reference: Number(paths[paths.length - 1]),
  };
};

const mapDispatchToProps = dispatch => ({
  getDetails: reference => {
    dispatch(fetchProsopographyByReference(reference));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DetailsPage)
);
