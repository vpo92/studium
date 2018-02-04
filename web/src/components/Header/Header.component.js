// @flow

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

type Props = {
  handleSideMenu: (openSideMenu: boolean) => void,
  showSideMenu: boolean,
  currentPageTitle: string,
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
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit">
              {this.props.currentPageTitle}
            </Typography>
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

export default Header;
