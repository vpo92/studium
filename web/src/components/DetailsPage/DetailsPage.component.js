// @flow

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import styles from './DetailsPage.style';
import GenericBlock from './GenericBlock.component';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { type Prosopography } from '../../../../batchs/src/rawFilesParser/types';
import localeData from './../../locales/messages.json';

type Props = {
  classes: any,
  history: any,
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => {this.props.history.goBack();}}
            >
              Retourner à la liste
          </Button>
        {prosopography && prosopography._id ? (
          <div>
            <Typography type="display2" className={this.props.classes.title}>
              {prosopography.identity.name.value}
            </Typography>
            <a name="fiche" />
            <br />
             <GenericBlock
               blockLabel = {localeData.fr.identity}
               block={prosopography.identity}
             />
             <GenericBlock
               blockLabel = {localeData.fr.origin}
               block={prosopography.origin}
             />
             <GenericBlock
               blockLabel = {localeData.fr.relationalInsertion}
               block={prosopography.relationalInsertion}
             />
             <GenericBlock
               blockLabel = {localeData.fr.curriculum}
               block={prosopography.curriculum}
             />
             <GenericBlock
               blockLabel = {localeData.fr.ecclesiasticalCareer}
               block={prosopography.ecclesiasticalCareer}
             />
             <GenericBlock
               blockLabel = {localeData.fr.professionalCareer}
               block={prosopography.professionalCareer}
             />
             <GenericBlock
               blockLabel = {localeData.fr.politicalCareer}
               block={prosopography.politicalCareer}
             />
             <GenericBlock
               blockLabel = {localeData.fr.travels}
               block={prosopography.travels}
             />
             <GenericBlock
               blockLabel = {localeData.fr.commissions}
               block={prosopography.commissions}
             />
             <GenericBlock
               blockLabel = {localeData.fr.assets}
               block={prosopography.assets}
             />
             <GenericBlock
               blockLabel = {localeData.fr.distinctiveSign}
               block={prosopography.distinctiveSign}
             />
             <GenericBlock
               blockLabel = {localeData.fr.orality}
               block={prosopography.orality}
             />
             <GenericBlock
               blockLabel = {localeData.fr.otherActivities}
               block={prosopography.otherActivities}
             />
          </div>
        ) : null}
      </div>
    );
  }
}

export default withStyles(styles)(DetailsPage);
