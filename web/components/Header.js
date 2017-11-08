import React, { PropTypes, Component } from 'react';
import AppBar from 'material-ui/AppBar';

import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';

import {white} from 'material-ui/styles/colors';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import { Switch, Route, Link } from 'react-router-dom';

const styles = {
  toolbar: {
    backgroundColor: "none",
    color:"#fff"
  }
};

  //<FlatButton label="Se connecter" onClick={props.handleConnect}/>

const Login = (props) => (
  <MenuItem><Link to="/login">Se connecter</Link></MenuItem>
);

class Logged extends Component {

  constructor(props){
    super(props);
    this.state = {
       username: props.username
     };
     //this.handleDisconnect.bind(props.handleDisconnect);
  }

  render(props) {
    return (
      <Toolbar style={styles.toolbar}>
            <ToolbarGroup>{this.state.username}</ToolbarGroup>
            <ToolbarGroup>
              <IconMenu
                iconButtonElement={
                  <IconButton><MoreVertIcon color={white}/></IconButton>
                }
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
              >
                <Link to="/profil"><MenuItem primaryText="Mon profil" /></Link>
                <MenuItem primaryText="Se déconnecter" onClick={this.props.handleDisconnect} />
              </IconMenu>
            </ToolbarGroup>
      </Toolbar>
    )
  }
}

class Header extends Component {

  constructor(props){
    super(props);

     //this.handleConnect.bind(this);
     //this.handleDisconnect.bind(this);

     this.state = {
        username: "Vincent Poupet",
        logged:false,
        activateLoginFeature:false
      };
  }

   handleDisconnect(){
     console.log("handleDisconnect");
     this.setState({
       logged : false
     });
   }

   handleConnect(){
     console.log("handleConnect");
     this.setState({
       logged : true,
       username: "Vincent Poupet"
     });
   }

  render() {
    return (
      <header className="header">
          <AppBar
              title="Studium"
              iconElementRight={this.state.activateLoginFeature?(this.state.logged ?
                <Logged handleDisconnect={this.handleDisconnect.bind(this)} username={this.state.username}/> :
                <Login handleConnect={this.handleConnect.bind(this)} />):<div />}
          />
      </header>
    );
  }
}

export default Header;
