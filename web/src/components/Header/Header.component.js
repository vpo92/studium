// @flow

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

// const styles = {
//   toolbar: {
//     backgroundColor: "none",
//     color:"#fff",
//   },
// };

type Props = {
  handleSideMenu: (openSideMenu: boolean) => void,
  showSideMenu: boolean,
  currentPage: string,
}

class Header extends Component<Props> {

  constructor(props: Props){
    super(props);
  }

  render() {
    return (
      <header className="header">
        <AppBar>
          <Toolbar>
            <IconButton onClick={() => this.props.handleSideMenu(!this.props.showSideMenu)} color="contrast" aria-label="Menu">
              <MenuIcon/>
            </IconButton>
            <Typography type="title" color="inherit">
              {this.props.currentPage}
            </Typography>
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

export default Header;
