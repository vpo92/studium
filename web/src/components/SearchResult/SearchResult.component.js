// @flow

import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';

import ResultRow from './ResultRow/ResultRow.component';
import styles from './SearchResult.style';

import { type Prosopography } from '../../../../api/types/Prosopography';

type Props = {
  data: Prosopography[],
  classes: any,
};

type State = {
  value: number,
};

class SearchResult extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    return (
        (this.props.data && this.props.data.length > 0)?(
          <div>
            <h1>Résultats ({this.props.data.length})</h1>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Référence</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.data.map(item => (
                  <ResultRow key={item._id} profile={item} />
                ))}
              </TableBody>
            </Table>
          </div>
        ):("")
    );
  }
}

export default withStyles(styles)(SearchResult);
