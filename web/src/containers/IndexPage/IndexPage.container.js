// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import IndexPage from '../../components/IndexPage/IndexPage.component';
import { getProsopographiesByFirstLetter } from '../../actions/Search/searchActions';
import { fetchProsopographiesByFirstLetter } from '../../services/searchService'

const mapStateToProps = (state) => {
  return {
    proposographiesByFirstLetter: state.studium.prosopographiesByFirstLetter,
  };
}

const mapDispatchToProps = dispatch =>
({
  getProposographiesByFirstLetter: async (letter) => {
    const result = await fetchProsopographiesByFirstLetter(letter);
    return dispatch(getProsopographiesByFirstLetter(letter, result));
  },
});

/** **********************
* Exports              *
************************
*/
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IndexPage));
