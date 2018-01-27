// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from 'material-ui/Table';

import { slugify, getValue } from './utils';

import { type Profile } from '../../actions/Search/searchTypes';

export type Props = {
  profile: Profile,
  showItem: (itemId: string) => void,
}

const ResultRow = (props: Props) => {
  const row = props.profile;
  return row.identity?(
    <TableRow key={row._id}>
      <TableCell>{row.reference}</TableCell>
      <TableCell>{getValue(row.identity.name)}</TableCell>
      <TableCell>{getValue(row.identity.status)}</TableCell>
      <TableCell>{getValue(row.identity.description)}</TableCell>
      <TableCell >
        <Link onClick={() => props.showItem(row._id)} to={"/fiches/"+ slugify(getValue(row.identity.name)+"-"+row.reference).toLowerCase()}>Voir</Link>
      </TableCell>
    </TableRow>
  ):
  (<TableRow key={row._id}>
    <TableCell>Error</TableCell>
    <TableCell>Error</TableCell>
    <TableCell>Error</TableCell>
    <TableCell>Error</TableCell>
    <TableCell>Error</TableCell>
  </TableRow>)
};

export default ResultRow;
