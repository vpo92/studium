// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import IndexPage from '../../components/IndexPage/IndexPage.component';
import { fetchProsopographiesByFirstLetter } from '../../services/searchService';

const mapStateToProps = state => {
  return {
    proposographiesByFirstLetter: state.studium.prosopographiesByFirstLetter,
  };
};

const mapDispatchToProps = dispatch => ({
  getProposographiesByFirstLetter: letter => {
    dispatch(fetchProsopographiesByFirstLetter(letter));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IndexPage)
);
