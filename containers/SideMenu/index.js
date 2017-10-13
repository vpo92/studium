import React, { PropTypes, Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

class SideMenu extends Component {

  //<MenuItem>Index Tabulaire</MenuItem>
  //<MenuItem>Gestion</MenuItem>

  render() {
    return (
      <Drawer open={true} className="app-drawer">
        <AppBar title="Studium" showMenuIconButton={false}/>
        <div className="app-text-center">
          <img src="containers/SideMenu/img/logo_par.png" height="180px" />
        </div>
        <Divider />
        <Link to="/"><MenuItem>Accueil</MenuItem></Link>
        <Link to="/recherche"><MenuItem>Recherche</MenuItem></Link>
        <Link to="/index"><MenuItem>Index</MenuItem></Link>
        <Link to="/contact"><MenuItem>Contact</MenuItem></Link>
        <Link to="/aide"><MenuItem>Aide</MenuItem></Link>
      </Drawer>
    );
  }
}

export default SideMenu;
