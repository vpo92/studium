// @flow

import React, { Component } from 'react';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { MenuList } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import logo from './img/logo_par.png';

import MenuLink from '../../containers/SideMenu/MenuLink.container';

type Props = {
  showSideMenu: boolean,
  handleSideMenu: (openSideMenu: boolean) => void,
}

class SideMenu extends Component<Props> {
  render() {
    return (
      <Drawer
        open={this.props.showSideMenu}
        onRequestClose={() => this.props.handleSideMenu(false)}
        className="app-drawer"
        width={400}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography type="title" color="inherit">
              Studium
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="app-text-center">
          <img src={logo} height="180px" />
        </div>
        <Divider />
        <MenuList>
          <MenuLink title='Accueil' url='/' />
          <MenuLink title='Recherche' url='/recherche' />
          <MenuLink title='Index' url='/index' />
          <MenuLink title='Contact' url='/contact' />
          <MenuLink title='Aide' url='/aide' />
        </MenuList>
      </Drawer>
    );
  }
}

export default SideMenu;
