// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Header from '../../components/Header/Header.component';
import { toggleSideMenu } from '../../actions/Menu/menuActions';

const mapStateToProps = (state) => {
  return {
    showSideMenu: state.studium.showSideMenu,
    currentPage: state.studium.currentPage,
  };
}

const mapDispatchToProps = dispatch =>
({
  handleSideMenu: (openSideMenu) => {
    return dispatch(toggleSideMenu(openSideMenu));
  },
});

/** **********************
* Exports              *
************************
*/
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
