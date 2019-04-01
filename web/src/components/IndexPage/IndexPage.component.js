// @flow
import React from 'react';
import {Link} from 'react-router-dom';
//import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

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


function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class IndexPage extends React.Component<Props, State> {

  defaultLetter = 'A';

  constructor(props: Props) {
    super();
    if (!props.proposographiesByFirstLetter.letter) {
      props.getProposographiesByFirstLetter(this.defaultLetter);
    }
  }

  handleChange = (event, value) => {
    this.props.getProposographiesByFirstLetter(value);
  };

  render() {
    const { letter, prosopographies } = this.props.proposographiesByFirstLetter;

    return (
      <div className={this.props.classes.container}>
        <h1>Index</h1>
        <AppBar position="static" color="default">
          <Tabs
            value={letter ? letter : this.defaultLetter}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="on"
            >
            {alphabet.map(tabLetter => (
              <Tab
                key={tabLetter}
                label={tabLetter}
                value={tabLetter}
                className={this.props.classes.tabs}/>
            ))}
          </Tabs>
        </AppBar>
        <TabContainer>
          <GridList cols={4}>
            <GridListTile key="Subheader" cols={4} style={{ height: 'auto' }}>
              <ListSubheader component="div">Résultat(s)</ListSubheader>
            </GridListTile>
          {
            prosopographies.length > 0 ?
            (
            prosopographies.map(prosopography => (
            <GridListTile key={prosopography.reference}>
              <Paper className={this.props.classes.resultItem}>
                <Typography variant="h6">{prosopography.identity.name.value} </Typography>
                <Button
                variant="contained"
                color="default"
                component={Link}
                to={`/fiches/${prosopography.reference}`}>Voir la fiche</Button>
              </Paper>
            </GridListTile>
            ))
            ):(
              <GridListTile cols={4} key="no-res">
                <Paper className={this.props.classes.resultItem}>
                  Aucun résultats
                </Paper>
              </GridListTile>
              )

          }
          </GridList>
        </TabContainer>

      </div>
    );
  }
}

//export default injectSheet(styles)(IndexPage);
export default withStyles(styles)(IndexPage);
