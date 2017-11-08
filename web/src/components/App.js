// @flow

import React, { Component, PropTypes } from "react";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { Switch, Route, Link } from 'react-router-dom';

//Pages
import SideMenu from '../components/SideMenu/SideMenu.component';
import HomePage from '../components/HomePage';
import IndexPage from '../components/IndexPage';
import SearchPage from '../containers/SearchPage/SearchPage.container';
import ContactPage from '../components/ContactPage';
import HelpPage from '../components/HelpPage';
import ProfilPage from '../components/ProfilPage';
import LoginPage from '../components/LoginPage';
import DetailPage from '../components/DetailPage';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from '../material_ui_raw_theme_file'

class App extends Component<{}, {}> {
  render() {
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
