import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
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
    <TableRow key={row.reference}>
      <TableRowColumn key={row.reference}>{row.reference}</TableRowColumn>
      <TableRowColumn key={row.reference}>{row.identity.name.value}</TableRowColumn>
      <TableRowColumn key={row.reference}>{row.identity.status.value}</TableRowColumn>
      <TableRowColumn key={row.reference}>{row.identity.description.value}</TableRowColumn>
      <TableRowColumn key={row.reference}>
        <Link to={"/fiches/"+ slugify(row.identity.name.value+" "+row.reference).toLowerCase()}>Voir</Link>
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
