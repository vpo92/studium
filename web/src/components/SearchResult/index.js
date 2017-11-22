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
  if(text){
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }else{
    return "";
  }
}

const GetValue = (data) => {
  if(data!=null && data.value!=null &&  (typeof data.value === 'string')){
    return <div>{data.value.toString()}</div>
  }else{
    return <div></div>
  }
}

const ResultRow = (row) => {
    return row.identity?(
    <TableRow key={row._id}>
      <TableRowColumn key={row._id}><div>{row.reference}</div></TableRowColumn>
      <TableRowColumn key={row._id}>{GetValue(row.identity.name)}</TableRowColumn>
      <TableRowColumn key={row._id}>{GetValue(row.identity.status)}</TableRowColumn>
      <TableRowColumn key={row._id}>{GetValue(row.identity.description)}</TableRowColumn>
      <TableRowColumn >
        <Link to={"/fiches/"+ slugify(GetValue(row.identity.name)+"-"+row.reference).toLowerCase()}>Voir</Link>
      </TableRowColumn>
    </TableRow>
  ):
  (<TableRow key={row._id}>
    <TableRowColumn>Error</TableRowColumn>
    <TableRowColumn>Error</TableRowColumn>
    <TableRowColumn>Error</TableRowColumn>
    <TableRowColumn>Error</TableRowColumn>
    <TableRowColumn>Error</TableRowColumn>
  </TableRow>)

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
