import React, { Component, PropTypes } from "react";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { Switch, Route, Link } from 'react-router-dom';

//Pages
import SideMenu from '../containers/SideMenu';
import HomePage from '../containers/HomePage';
import IndexPage from '../containers/IndexPage';
import SearchPage from '../containers/SearchPage';
import ContactPage from '../containers/ContactPage';
import HelpPage from '../containers/HelpPage';
import ProfilPage from '../containers/ProfilPage';
import LoginPage from '../containers/LoginPage';
import DetailPage from '../containers/DetailPage';

// For Customization Options, edit  or use
// './src/material_ui_raw_theme_file.jsx' as a template.
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from '../src/material_ui_raw_theme_file'

class App extends Component {
  render() {
    const { todos, actions } = this.props;
    return (
      <div>
        <MuiThemeProvider muiTheme={theme}>
          <div>
            <SideMenu />
            <Header/>
            <div className="app-main">
              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route path="/index" component={IndexPage} />
                <Route path="/recherche" component={SearchPage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/aide" component={HelpPage} />
                <Route path="/profil" component={ProfilPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/fiches/:id" component={DetailPage} />
              </Switch>
              <Footer />
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}
export default App;
