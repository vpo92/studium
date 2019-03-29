// @flow

import React, { Component } from 'react';

import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import logo from './img/logo_par.png';
import { getMenuLinks } from '../App.component';

import MenuLink from '../../containers/SideMenu/MenuLink.container';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  appDrawer: {
    width:'200px',
  },
}

type Props = {
  showSideMenu: boolean,
  handleSideMenu: (openSideMenu: boolean) => void,
  isAuthenticated: boolean,
};

class SideMenu extends Component<Props> {
/**
  {getMenuLinks().map(link => (
   <MenuLink key={link.path} title={link.title} url={link.path} />
 ))}
  */

  render() {
    return (
      <div>
      <Drawer
        anchor="left"
        open={this.props.showSideMenu}
        onClose={() => this.props.handleSideMenu(false)}
        width={400}
      >
        <AppBar position="static"
          className={this.props.classes.appDrawer}>
          <Toolbar>
            <Typography variant="title" color="inherit">
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
              link.secure && !this.props.isAuthenticated?
              null
              :
              <MenuLink key={link.path} title={link.title} url={link.path} />
           ))}
        </MenuList>
      </Drawer>
    </div>
    );
  }
}


export default withStyles(styles)(SideMenu);
