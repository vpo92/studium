// @flow

export type SideMenuAction = {
  type: 'TOGGLE_SIDE_MENU',
  showSideMenu: boolean,
};

export type ChangePageAction = {
  type: 'CHANGE_PAGE',
  newPage: string,
};
