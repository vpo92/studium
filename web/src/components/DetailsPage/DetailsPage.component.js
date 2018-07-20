// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';
import GenericBlock from './GenericBlock.component';
import Typography from 'material-ui/Typography';

import { type Prosopography } from '../../../../batchs/src/rawFilesParser/types';

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
        <p>
          <button
            onClick={() => {
              this.props.history.push('/recherche');
            }}
          >
            Retourner à la liste
          </button>
        </p>
        {prosopography && prosopography._id ? (
          <div>
            <Typography type="display2" className={this.props.classes.title}>
              {prosopography.identity.name.value}
            </Typography>
            <a name="fiche" />
            <br />
             <GenericBlock
               blockLabel = "Fiche d’identité"
               block={prosopography.identity}
             />
             <GenericBlock
               blockLabel = "Origine et situation géographique"
               block={prosopography.origin}
             />
             <GenericBlock
               blockLabel = "Insertion relationnelle"
               block={prosopography.relationalInsertion}
             />
             <GenericBlock
               blockLabel = "Cursus"
               block={prosopography.curriculum}
             />
             <GenericBlock
               blockLabel = "Carrière ecclésiastique"
               block={prosopography.ecclesiasticalCareer}
             />
             <GenericBlock
               blockLabel = "Carrière professionnelle"
               block={prosopography.professionalCareer}
             />
             <GenericBlock
               blockLabel = "Carrière politique et vicissitudes diverses"
               block={prosopography.politicalCareer}
             />
             <GenericBlock
               blockLabel = "Voyage"
               block={prosopography.travels}
             />
             <GenericBlock
               blockLabel = "Commission/Expertise "
               block={prosopography.commissions}
             />
             <GenericBlock
               blockLabel = "Logement et patrimoine"
               block={prosopography.assets}
             />
             <GenericBlock
               blockLabel = "Signes d’individuation"
               block={prosopography.distinctiveSign}
             />
             <GenericBlock
               blockLabel = "Oralité"
               block={prosopography.orality}
             />
             <GenericBlock
               blockLabel = "Varia"
               block={prosopography.otherActivities}
             />
          </div>
        ) : null}
      </div>
    );
  }
}

export default injectSheet(styles)(DetailsPage);
