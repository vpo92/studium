// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import SideMenu from '../../components/SideMenu/SideMenu.component';
import { showSideMenu } from '../../actions/Menu/menuActions';

const mapStateToProps = state => {
  return {
    showSideMenu: state.studium.showSideMenu,
  };
};

const mapDispatchToProps = dispatch => ({
  handleSideMenu: openSideMenu => {
    return dispatch(showSideMenu(openSideMenu));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SideMenu)
);
