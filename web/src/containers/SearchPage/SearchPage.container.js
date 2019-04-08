// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import SearchPage from '../../components/SearchPage/SearchPage.component';
import { fetchProsopographiesByKeyword, fetchProsopographiesBySearch } from '../../services/searchAPIService';

const mapStateToProps = state => {
  return {
    search: state.studium.prosopographiesByKeyword,
  };
};

const mapDispatchToProps = dispatch => ({
  handleKeywordSearch: (keyword: string) => {
    dispatch(fetchProsopographiesByKeyword(keyword));
  },
  handleAdvancedSearch: (searchRequest: SearchRequest) => {
    dispatch(fetchProsopographiesBySearch(searchRequest));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchPage)
);
