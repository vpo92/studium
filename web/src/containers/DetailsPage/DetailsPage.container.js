// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import DetailsPage from '../../components/DetailsPage/DetailsPage.component';
import { getProsopographyDetails } from '../../actions/Search/searchActions';
import { fetchProsopographyByReference } from '../../services/searchService';

const mapStateToProps = (state, ownProps) => {
  const paths = ownProps.location.pathname.split('/');
  return {
    prosopography: state.studium.prosopographyDetails,
    reference: Number(paths[paths.length - 1]),
  };
};

const mapDispatchToProps = dispatch => ({
  getDetails: async reference => {
    const result = await fetchProsopographyByReference(reference);
    return dispatch(getProsopographyDetails(result));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DetailsPage)
);
