// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuLink from '../../components/SideMenu/MenuLink/MenuLink.component';
import { showSideMenu } from '../../actions/Menu/menuActions';
import { getTitleFromPathname } from '../../components/App';

const mapStateToProps = (state, ownProps) => {
  return {
    showSideMenu: state.studium.showSideMenu,
    currentPageTitle: getTitleFromPathname(ownProps.location.pathname),
  };
};

const mapDispatchToProps = dispatch => ({
  showSideMenu: () => {
    return dispatch(showSideMenu(false));
  },
});

/** **********************
 * Exports              *
 ************************
 */
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MenuLink)
);
