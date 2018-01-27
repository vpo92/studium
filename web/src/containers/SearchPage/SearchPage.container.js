// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import SearchPage from '../../components/SearchPage/SearchPage.component';
import { fetchSearchByKeyword } from '../../services/searchService';
import { search } from '../../actions/Search/searchActions';

const mapStateToProps = (state) => {
    return {
      search: state.studium.search,
    };
  }

const mapDispatchToProps = dispatch =>
  ({
    handleKeyWordSearch: async (keyWord: string) => {
      const result = await fetchSearchByKeyword(keyWord);
      return dispatch(search({ keyWord, result }));
    },
  });


/** **********************
 * Exports              *
 ************************
 */
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
