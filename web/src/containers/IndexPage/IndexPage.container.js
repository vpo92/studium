// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import IndexPage from '../../components/IndexPage/IndexPage.component';
import {
  getProsopographiesByFirstLetter,
  showSnackbar,
} from '../../actions/Search/searchActions';
import { fetchProsopographiesByFirstLetter } from '../../services/searchService';

const mapStateToProps = state => {
  return {
    proposographiesByFirstLetter: state.studium.prosopographiesByFirstLetter,
  };
};

const mapDispatchToProps = dispatch => ({
  getProposographiesByFirstLetter: async letter => {
    try {
      const result = await fetchProsopographiesByFirstLetter(letter);
      return dispatch(getProsopographiesByFirstLetter(letter, result));
    } catch (e) {
      return dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IndexPage)
);
