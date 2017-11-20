// @flow

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import List, { ListItem, ListItemText } from 'material-ui/List';
import injectSheet from 'react-jss';

import data from './data';
import styles from './IndexPage.style';

const Row = (row) => {
  return (
    <ListItem key={row.id}>
      <ListItemText primary={row.lastname+" "+row.name} secondary="Jan 10, 2014" />
    </ListItem>
  );
}

type State = {
  value: number,
}

class IndexPage extends Component<{classes: any}, State> {

  constructor() {
    super();
    this.state = {
      value: 0,
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };
  render() {
    return (
      <div className={this.props.classes.container}>
        <h1>Index</h1>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="on"
            onChange={this.handleChange}
            className={this.props.classes.tabs}
            >
              <Tab label="A"/>
              <Tab label="B"/>
              <Tab label="C"/>
              <Tab label="D"/>
              <Tab label="E"/>
              <Tab label="F"/>
              <Tab label="G"/>
              <Tab label="H"/>
              <Tab label="I"/>
              <Tab label="J"/>
              <Tab label="K"/>
              <Tab label="L"/>
              <Tab label="M"/>
              <Tab label="N"/>
              <Tab label="O"/>
              <Tab label="P"/>
              <Tab label="Q"/>
              <Tab label="R"/>
              <Tab label="S"/>
              <Tab label="T"/>
              <Tab label="U"/>
              <Tab label="V"/>
              <Tab label="W"/>
              <Tab label="X"/>
              <Tab label="Y"/>
              <Tab label="Z"/>
            </Tabs>
          </AppBar>
          <List>
            {data.map(Row)}
          </List>
        </div>
      );
    }
  }

  export default injectSheet(styles)(IndexPage);
