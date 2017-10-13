import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';

import {Tabs, Tab} from 'material-ui/Tabs';
import { Switch, Route, Link } from 'react-router-dom';

//FIXME : use a lib instead
function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const ResultRow = (row) => {
  return (
    <TableRow key={row.id}>
      <TableRowColumn key={row.id}>{row.id}</TableRowColumn>
      <TableRowColumn key={row.id}>{row.name}</TableRowColumn>
      <TableRowColumn key={row.id}>{row.mediane}</TableRowColumn>
      <TableRowColumn key={row.id}>{row.status}</TableRowColumn>
      <TableRowColumn key={row.id}>{row.origine}</TableRowColumn>
      <TableRowColumn key={row.id}>
        <Link to={"/fiches/"+ slugify(row.name+" "+row.id).toLowerCase()}>Voir</Link>
      </TableRowColumn>
    </TableRow>
  );
};

class SearchResult extends Component {


  render(props) {
    return (
      <div>
        <Table selectable={false}>
            <TableHeader>
              <TableRow>
                <TableHeaderColumn>Référence</TableHeaderColumn>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Mediane</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
                <TableHeaderColumn>Origine</TableHeaderColumn>
                <TableHeaderColumn>Action</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {this.props.data.map(ResultRow)}
            </TableBody>
        </Table>
          <div className="app-search-paginator">
            <Tabs>
              <Tab label="1"></Tab>
              <Tab label="2"></Tab>
              <Tab label="3"></Tab>
            </Tabs>
        </div>
      </div>
    );
  }
}

export default SearchResult;
