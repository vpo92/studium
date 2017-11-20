// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import SideMenu from '../../components/SideMenu/SideMenu.component';
import { toggleSideMenu } from '../../actions/Menu/menuActions';

const mapStateToProps = (state) => {
  return {
    showSideMenu: state.studium.showSideMenu,
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SideMenu));
