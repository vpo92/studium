// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import SearchPage from '../../components/SearchPage/SearchPage.component';
import { searchByKeyWord } from '../../services/searchService';

const mapStateToProps = (state) => {
    return {
      search: state.search
    };
  }

const mapDispatchToProps = dispatch =>
  ({
    handleKeyWordSearch: async (keyWord) => {
      return dispatch(await searchByKeyWord(keyWord));
    }
  });


/** **********************
 * Exports              *
 ************************
 */
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
