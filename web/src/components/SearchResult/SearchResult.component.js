// @flow

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Tabs, { Tab } from 'material-ui/Tabs';
import injectSheet from 'react-jss';

import ResultRow from '../ResultRow/ResultRow.component';
import styles from './SearchResult.style';

import { type Profile } from '../../actions/Search/searchTypes';

type Props = {
  data: Profile[],
  classes: any,
  showItem: (itemId: string) => void,
};

type State = {
  value: number,
}

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
      <div>
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
            {this.props.data.map((item) => (
              <ResultRow key={item._id} showItem={this.props.showItem} profile={item} />
            ))}
          </TableBody>
        </Table>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleChange}
            >
              <Tab label="1" />
              <Tab label="2" />
              <Tab label="3" />
            </Tabs>
          </AppBar>
        </div>
      );
    }
  }

  export default injectSheet(styles)(SearchResult);
