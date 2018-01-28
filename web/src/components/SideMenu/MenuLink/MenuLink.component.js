// @flow

import * as React from 'react';
import { MenuItem } from 'material-ui/Menu';
import { Link } from 'react-router-dom';
import injectSheet from 'react-jss';

import styles from './MenuLink.style';

type Props = {
  url: string,
  title: string,
  currentPageTitle: string,
  toggleSideMenu: () => void,
  classes: any,
};

const MenuLink = (props: Props) => (
  <MenuItem
    onClick={() => props.toggleSideMenu()}
    component={Link}
    to={props.url}
    disabled={props.currentPageTitle === props.title}
    className={
      props.currentPageTitle === props.title
        ? props.classes.currentPageLink
        : ''
    }
  >
    {props.title}
  </MenuItem>
);

export default injectSheet(styles)(MenuLink);
