// @flow

import React, { Component } from 'react';
import { Switch, Route as ReactRouterDom } from 'react-router-dom';

//components
import Footer from '../components/Footer/Footer.component';
import Header from '../containers/Header/Header.container';
import SideMenu from '../containers/SideMenu/SideMenu.container';
import HomePage from '../components/HomePage/HomePage.component';
import IndexPage from '../containers/IndexPage/IndexPage.container';
import SearchPage from '../containers/SearchPage/SearchPage.container';
import ContactPage from '../components/ContactPage/ContactPage.component';
import HelpPage from '../components/HelpPage/HelpPage.component';
import DetailsPage from '../containers/DetailsPage/DetailsPage.container';
import LoginPage from '../containers/LoginPage/LoginPage.container';
import Snackbar from '../containers/Snackbar/Snackbar.container';
import EditPage from '../containers/EditPage/EditPage.container';
import LogoutPage from '../containers/LogoutPage/LogoutPage.container';

type Route = {
  path: string,
  title: string,
  isInMenu: boolean,
  component: React$Component<*>,
  secure: boolean,
};

const appRoutes: Route[] = [
  { path: '/', title: 'Accueil', isInMenu: true, component: HomePage },
  {
    path: '/recherche',
    title: 'Recherche',
    isInMenu: true,
    component: SearchPage,
  },
  { path: '/index', title: 'Index', isInMenu: true, component: IndexPage },
  {
    path: '/contact',
    title: 'Contact',
    isInMenu: true,
    component: ContactPage,
  },
  { path: '/aide', title: 'Aide', isInMenu: true, component: HelpPage },
  {
    path: '/fiches/:id',
    title: 'Fiche',
    isInMenu: false,
    component: DetailsPage,
  },
  { path: '/login', title: 'Connexion', isInMenu: false, component: LoginPage },
  { path: '/edition', title: 'Edition', isInMenu: true, component: EditPage },
  { path: '/fiches/edit/:id', title: 'Edition', isInMenu: false, component: EditPage },
  { path: '/logout', title: 'Déconnexion', isInMenu: false, component: LogoutPage },
];

export function getTitleFromPathname(pathname: string): string {
  const title = appRoutes.filter(
    appRoute => pathname.split('/')[1] === appRoute.path.split('/')[1]
  );
  if (title.length !== 1) {
    throw new Error(
      `No route or no unique route found for this path : ${pathname}.`
    );
  } else {
    return title[0].title;
  }
}

export function getMenuLinks(): {
  title: string,
  path: string,
}[] {
  return appRoutes
    .filter(appRoute => appRoute.isInMenu)
    .map(routeInMenu => ({ title: routeInMenu.title, path: routeInMenu.path }));
}

type Props = {
  getApiUrl: () => void,
};

class App extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.props.getApiUrl();
  }

  render() {
    return (
      <div>
        <SideMenu />
        <Header />
        <Switch>
          {appRoutes.map(route => (
            <ReactRouterDom
              exact
              key={route.path}
              path={route.path}
              component={route.component}
            />
          ))}
        </Switch>
        <Footer />
        <Snackbar />
      </div>
    );
  }
}
export default App;
