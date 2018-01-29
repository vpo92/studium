// @flow

import React, { Component } from 'react';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { MenuList } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import logo from './img/logo_par.png';
import { getMenuLinks } from '../App';

import MenuLink from '../../containers/SideMenu/MenuLink.container';

type Props = {
  showSideMenu: boolean,
  handleSideMenu: (openSideMenu: boolean) => void,
};

class SideMenu extends Component<Props> {
  render() {
    return (
      <Drawer
        open={this.props.showSideMenu}
        onClose={() => this.props.handleSideMenu(false)}
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
          {getMenuLinks().map(link => (
            <MenuLink key={link.path} title={link.title} url={link.path} />
          ))}
        </MenuList>
      </Drawer>
    );
  }
}

export default SideMenu;
