// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import SearchPage from '../../components/SearchPage/SearchPage.component';
import { fetchSearchByKeyword } from '../../services/searchService';
import { search, showSnackbar } from '../../actions/Search/searchActions';

const mapStateToProps = state => {
  return {
    search: state.studium.search,
  };
};

const mapDispatchToProps = dispatch => ({
  handleKeyWordSearch: async (keyWord: string) => {
    try {
      const result = await fetchSearchByKeyword(keyWord);
      return dispatch(search({ keyWord, result }));
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
  connect(mapStateToProps, mapDispatchToProps)(SearchPage)
);
