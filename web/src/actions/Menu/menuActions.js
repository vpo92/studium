// @flow

import {
  type SideMenuAction,
  type ChangePageAction,
} from '../../actions/Menu/menuTypes';

export const showSideMenu: (
  showSideMenu: boolean
) => SideMenuAction = showSideMenu => ({
  type: 'SHOW_SIDE_MENU',
  showSideMenu,
});

export const changePage: (newPage: string) => ChangePageAction = newPage => ({
  type: 'CHANGE_PAGE',
  newPage,
});
