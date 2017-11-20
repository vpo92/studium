// @flow

import {
  type SideMenuAction,
  type ChangePageAction,
} from '../../actions/Menu/menuTypes';

export const toggleSideMenu: ((showSideMenu: boolean) => SideMenuAction) = showSideMenu => ({
  type: 'TOGGLE_SIDE_MENU',
  showSideMenu,
});

export const changePage: ((newPage: string) => ChangePageAction) = newPage => ({
  type: 'CHANGE_PAGE',
  newPage,
});
