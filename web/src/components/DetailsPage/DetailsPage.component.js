// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { Link } from 'react-router-dom';

import styles from './DetailsPage.style';
import Identity from './Identity.component';
import Origin from './Origin.component';
import RelationalInsertion from './Relation.component';
import ExpansionPanel, {ExpansionPanelSummary,ExpansionPanelDetails} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';

import { type Prosopography } from '../../actions/Search/searchTypes';

type Props = {
  classes: any,
  prosopography: ?Prosopography,
  reference: number,
  getDetails: (reference: number) => void,
};

type State = {
  currentTab: string,
};

class DetailsPage extends Component<Props,State> {

  constructor(props: Props) {
    super(props);
    props.getDetails(props.reference);
    this.state = {
      currentTab: "identity",
    };
  }

  handleChangeTab = (e,newVal) => {
    this.setState({
      currentTab : newVal,
    });
  }


  handleChange = panel => (event, expanded) => {
    this.setState({
      currentTab: expanded ? panel : "false",
    });
  };

  render() {
    const { prosopography } = this.props;
    return (
      <div className={this.props.classes.container}>
        <p>
          <Link to="/recherche">Retourner à la liste</Link>
        </p>
        {prosopography ? (
          <div>
            <Typography type="display2" className={this.props.classes.title}>{prosopography.identity.name.value}</Typography>
            <a name="fiche"></a>
            <br/>
            <ExpansionPanel expanded={this.state.currentTab === 'identity'} onChange={this.handleChange("identity")}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography type="headline" className={this.props.classes.primaryColor}>Carte d'identité</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography component="div" style={{ padding: 8 * 3 }}><Identity identity={prosopography.identity} /></Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel expanded={this.state.currentTab === 'origin'} onChange={this.handleChange("origin")}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography type="headline" className={this.props.classes.primaryColor}>Origine</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography component="div" style={{ padding: 8 * 3 }}><Origin origin={prosopography.origin} /></Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel expanded={this.state.currentTab === 'relation'} onChange={this.handleChange("relation")}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography type="headline" className={this.props.classes.primaryColor}>Relations</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography component="div" style={{ padding: 8 * 3 }}><RelationalInsertion relationalInsertion={prosopography.relationalInsertion} /></Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>

          </div>
        ) : null}
      </div>
    );
  }
}

/**
Tab version
<AppBar position="static" color="default">
  <Tabs
    value={this.state.currentTab}
    indicatorColor="primary"
    textColor="primary"
    scrollable
    scrollButtons="on"
    onChange={this.handleChange}
    className={this.props.classes.tabs}
  >
    <Tab key="identity" label="Carte d'identité" value="identity" />
    <Tab key="origin" label="Origine" value="origin" />
    <Tab key="relation" label="Relations" value="relation" />
  </Tabs>
</AppBar>
{this.state.currentTab === "identity" && <Typography component="div" style={{ padding: 8 * 3 }}><Identity identity={prosopography.identity} /></Typography>}
{this.state.currentTab === "origin" && <Typography component="div" style={{ padding: 8 * 3 }}><Origin origin={prosopography.origin} /></Typography>}
{this.state.currentTab === "relation" && <Typography component="div" style={{ padding: 8 * 3 }}><RelationalInsertion relationalInsertion={prosopography.relationalInsertion} /></Typography>}


*/

export default injectSheet(styles)(DetailsPage);
