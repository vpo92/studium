// @flow

import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuLink from '../../components/SideMenu/MenuLink.component';
import { changePage } from '../../actions/Menu/menuActions';

const mapStateToProps = (state) => {
  return {
    activeMenu: state.studium.activeMenu,
  };
}

const mapDispatchToProps = dispatch =>
({
  clickOnMenu: (newPage) => {
    return dispatch(changePage(newPage));
  },
});

/** **********************
* Exports              *
************************
*/
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MenuLink));
