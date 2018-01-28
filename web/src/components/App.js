// @flow

import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

//components
import Footer from '../components/Footer/Footer.component';
import Header from '../containers/Header/Header.container';
import SideMenu from '../containers/SideMenu/SideMenu.container';
import HomePage from '../components/HomePage/HomePage.component';
import IndexPage from '../containers/IndexPage/IndexPage.container';
import SearchPage from '../containers/SearchPage/SearchPage.container';
import ContactPage from '../components/ContactPage/ContactPage.component';
import HelpPage from '../components/HelpPage/HelpPage.component';
import ProfilPage from '../components/ProfilPage/ProfilPage.component';
import LoginPage from '../components/LoginPage/LoginPage.component';
import DetailsPage from '../containers/DetailsPage/DetailsPage.container';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from '../material_ui_raw_theme_file';

class App extends Component<{}> {
  render() {
    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <div>
            <SideMenu />
            <Header />
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/index" component={IndexPage} />
              <Route path="/recherche" component={SearchPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/aide" component={HelpPage} />
              <Route path="/profil" component={ProfilPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/fiches/:id" component={DetailsPage} />
            </Switch>
            <Footer />
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}
export default App;
