// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { Link } from 'react-router-dom';

import styles from './DetailsPage.style';
import Identity from './Identity.component';
import Origin from './Origin.component';
import RelationalInsertion from './Relation.component';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';

import { type Prosopography } from '../../../../api/types/Prosopography';

type Props = {
  classes: any,
  prosopography: ?Prosopography,
  reference: number,
  getDetails: (reference: number) => void,
};

type State = {
  currentTab: string,
};

class DetailsPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    props.getDetails(props.reference);
    this.state = {
      currentTab: 'identity',
    };
  }

  handleChange = panel => (event, expanded) => {
    this.setState({
      currentTab: expanded ? panel : 'false',
    });
  };

  render() {
    const { prosopography } = this.props;
    return (
      <div className={this.props.classes.container}>
        <p>
          <Link to="/recherche">Retourner à la liste</Link>
        </p>
        {prosopography && prosopography._id ? (
          <div>
            <Typography type="display2" className={this.props.classes.title}>
              {prosopography.identity.name.value}
            </Typography>
            <a name="fiche" />
            <br />
            <ExpansionPanel
              expanded={this.state.currentTab === 'identity'}
              onChange={this.handleChange('identity')}
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  type="headline"
                  className={this.props.classes.primaryColor}
                >
                  Carte d'identité
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography component="div" style={{ padding: 8 * 3 }}>
                  <Identity identity={prosopography.identity} />
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel
              expanded={this.state.currentTab === 'origin'}
              onChange={this.handleChange('origin')}
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  type="headline"
                  className={this.props.classes.primaryColor}
                >
                  Origine
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography component="div" style={{ padding: 8 * 3 }}>
                  <Origin origin={prosopography.origin} />
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel
              expanded={this.state.currentTab === 'relation'}
              onChange={this.handleChange('relation')}
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  type="headline"
                  className={this.props.classes.primaryColor}
                >
                  Relations
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography component="div" style={{ padding: 8 * 3 }}>
                  <RelationalInsertion
                    relationalInsertion={prosopography.relationalInsertion}
                  />
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        ) : null}
      </div>
    );
  }
}

export default injectSheet(styles)(DetailsPage);
