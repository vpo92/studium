// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Header from '../../components/Header/Header.component';
import { showSideMenu } from '../../actions/Menu/menuActions';
import { getTitleFromPathname } from '../../components/App';

const mapStateToProps = (state, ownProps) => {
  return {
    showSideMenu: state.studium.showSideMenu,
    currentPageTitle: getTitleFromPathname(ownProps.location.pathname),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
