// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';
import SimpleInformation from './SimpleInformation.component';
import SimpleDateInformation from './SimpleDateInformation.component';
import SimpleListInformation from './SimpleListInformation.component';

type Props = {
  classes: any,
  identity: Object,
};

class Identity extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { identity } = this.props;
    return (
      <div>
        <SimpleInformation
          label="Nom"
          value={identity.name}
        />
        <SimpleListInformation
          label="Variantes du nom"
          value={identity.nameVariant}
        />
        <SimpleInformation
          label="Description"
          value={identity.description}
        />
        <SimpleInformation
          label="Genre"
          value={identity.gender}
        />
        <SimpleDateInformation
          label="Période d'activité"
          value={identity.datesOfActivity}
        />
        <SimpleDateInformation
          label="Date de vie"
          value={identity.datesOfLife}
        />

        <SimpleInformation
          label="Statut"
          value={identity.status}
        />
      </div>
    );
  }
}


export default injectSheet(styles)(Identity);
