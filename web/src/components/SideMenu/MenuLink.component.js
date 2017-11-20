// @flow

import * as React from 'react';
import { MenuItem } from 'material-ui/Menu';
import { Link } from 'react-router-dom';

type Props = {
  url: string,
  title: string,
  clickOnMenu: (title: string) => void,
}

const MenuLink = (props: Props) =>
(
  <MenuItem onClick={() => props.clickOnMenu(props.title)}
    component={Link} to={props.url}>
    {props.title}
  </MenuItem>
);

export default MenuLink;
