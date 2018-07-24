// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { getValue } from './utils';
import { type Prosopography } from '../../../../../api/types/Prosopography';

export type Props = {
  profile: Prosopography,
};

const ResultRow = (props: Props) => {
  const row = props.profile;
  return row.identity ? (
    <TableRow key={row._id}>
      <TableCell>{row.reference}</TableCell>
      <TableCell>{getValue(row.identity.name)}</TableCell>
      <TableCell>{getValue(row.identity.status)}</TableCell>
      <TableCell>{getValue(row.identity.description)}</TableCell>
      <TableCell>
        <Link to={`/fiches/${row.reference}`}>Détails</Link>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={row._id}>
      <TableCell>Error</TableCell>
      <TableCell>Error</TableCell>
      <TableCell>Error</TableCell>
      <TableCell>Error</TableCell>
      <TableCell>Error</TableCell>
    </TableRow>
  );
};

export default ResultRow;
