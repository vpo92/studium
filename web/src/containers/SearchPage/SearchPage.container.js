// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import SearchPage from '../../components/SearchPage/SearchPage.component';
import { fetchProsopographiesByKeyword } from '../../services/searchService';

const mapStateToProps = state => {
  return {
    search: state.studium.prosopographiesByKeyword,
  };
};

const mapDispatchToProps = dispatch => ({
  handleKeywordSearch: (keyword: string) => {
    dispatch(fetchProsopographiesByKeyword(keyword));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchPage)
);
