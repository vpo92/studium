// @flow

import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import injectSheet from 'react-jss';
import styles from './Header.style';

type Props = {
  handleSideMenu: (openSideMenu: boolean) => void,
  showSideMenu: boolean,
  currentPageTitle: string,
  user: any,
};

class Header extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <header className="header">
        <AppBar>
          <Toolbar>
            <IconButton
              onClick={() =>
                this.props.handleSideMenu(!this.props.showSideMenu)
              }
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={this.props.classes.flex}>
              Studium / {this.props.currentPageTitle}
            </Typography>
            {
              this.props.user?
              (this.props.user.name):
              <Button
                color="inherit"
                component={Link}
                to="/login">
                Se Connecter
              </Button>
            }
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

//export default Header;
export default injectSheet(styles)(Header);
