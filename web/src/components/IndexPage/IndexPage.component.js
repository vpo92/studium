// @flow

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import List, { ListItem, ListItemText } from 'material-ui/List';
import { Link } from 'react-router-dom';
import injectSheet from 'react-jss';

import styles from './IndexPage.style';

const alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

import { type Prosopography } from '../../../../api/types/Prosopography';

type Props = {
  getProposographiesByFirstLetter: (letter: string) => void,
  proposographiesByFirstLetter: {
    letter: string,
    prosopographies: Prosopography[],
  },
  classes: any,
};

type State = {
  letter: string,
  prosopographies: Prosopography[],
};

class IndexPage extends Component<Props, State> {
  defaultLetter = 'A';

  constructor(props: Props) {
    super();
    if (!props.proposographiesByFirstLetter) {
      props.getProposographiesByFirstLetter(this.defaultLetter);
    }
  }

  handleChange = (event, value) => {
    this.props.getProposographiesByFirstLetter(value);
  };

  render() {
    return (
      <div className={this.props.classes.container}>
        <h1>Index</h1>
        <AppBar position="static" color="default">
          <Tabs
            value={
              this.props.proposographiesByFirstLetter
                ? this.props.proposographiesByFirstLetter.letter
                : this.defaultLetter
            }
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="on"
            onChange={this.handleChange}
            className={this.props.classes.tabs}
          >
            {alphabet.map(letter => (
              <Tab key={letter} label={letter} value={letter} />
            ))}
          </Tabs>
        </AppBar>
        <List>
          {this.props.proposographiesByFirstLetter
            ? this.props.proposographiesByFirstLetter.prosopographies.map(
                prosopography => (
                  <ListItem key={prosopography._id}>
                    <ListItemText primary={prosopography.identity.name.value} />
                    <Link to={`/fiches/${prosopography.reference}`}>
                      Détails
                    </Link>
                  </ListItem>
                )
              )
            : null}
        </List>
      </div>
    );
  }
}

export default injectSheet(styles)(IndexPage);
