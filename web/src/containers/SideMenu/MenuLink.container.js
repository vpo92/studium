// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuLink from '../../components/SideMenu/MenuLink/MenuLink.component';
import { toggleSideMenu } from '../../actions/Menu/menuActions';
import { getTitleFromPathname } from '../../components/App';

const mapStateToProps = (state, ownProps) => {
  return {
    showSideMenu: state.studium.showSideMenu,
    currentPageTitle: getTitleFromPathname(ownProps.location.pathname),
  };
};

const mapDispatchToProps = dispatch => ({
  toggleSideMenu: () => {
    return dispatch(toggleSideMenu(false));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MenuLink)
);
