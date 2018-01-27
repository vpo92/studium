// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import DetailPage from '../../components/DetailPage/DetailPage.component';

const mapStateToProps = (state) => {
  return {
    prosopography: state.studium.currentItem,
  };
}

/** **********************
* Exports              *
************************
*/
export default withRouter(connect(mapStateToProps, null)(DetailPage));
