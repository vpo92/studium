// @flow

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import List, { ListItem, ListItemText } from 'material-ui/List';
import injectSheet from 'react-jss';

import styles from './IndexPage.style';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

import { type Prosopography } from '../../actions/Search/searchTypes';

type Props = {
  getProposographiesByFirstLetter: (letter: string) => void,
  proposographiesByFirstLetter: {
    letter: string,
    prosopographies: Prosopography[],
  },
  classes: any,
}

type State = {
  letter: string,
  prosopographies: Prosopography[],
}

class IndexPage extends Component<Props, State> {

  constructor(props: Props) {
    super();
    props.getProposographiesByFirstLetter('A');
  }

  handleChange = async (event, value) => {
    this.props.getProposographiesByFirstLetter(value);
  };

  render() {
    return (
      <div className={this.props.classes.container}>
        <h1>Index</h1>
        <AppBar position="static" color="default">
          <Tabs
            value={this.props.proposographiesByFirstLetter ? this.props.proposographiesByFirstLetter.letter : 'A'}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="on"
            onChange={this.handleChange}
            className={this.props.classes.tabs}
            >
              {alphabet.map((letter) => (
                <Tab key={letter} label={letter} value={letter} />
              ))}
            </Tabs>
          </AppBar>
          <List>
            {this.props.proposographiesByFirstLetter ? this.props.proposographiesByFirstLetter.prosopographies.map(prosopography => (
              <ListItem key={prosopography._id}>
                <ListItemText primary={prosopography.identity.name.value} />
              </ListItem>
            )) : null}
          </List>
        </div>
      );
    }
  }

  export default injectSheet(styles)(IndexPage);
