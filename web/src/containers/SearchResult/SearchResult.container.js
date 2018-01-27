// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import SearchResult from '../../components/SearchResult/SearchResult.component';
import { showProsopography } from '../../actions/Search/searchActions';
import { fetchProsopographyById } from '../../services/searchService'

const mapDispatchToProps = dispatch =>
  ({
    showItem: async (itemId) => {
      const result = await fetchProsopographyById(itemId);
      return dispatch(showProsopography(result));
    },
  });


/** **********************
 * Exports              *
 ************************
 */
export default withRouter(connect(null, mapDispatchToProps)(SearchResult));
