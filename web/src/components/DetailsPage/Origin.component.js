// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';
import SimpleInformation from './SimpleInformation.component';
import SimpleListInformation from './SimpleListInformation.component';

type Props = {
  classes: any,
  origin: Object,
};

class Origin extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { origin } = this.props;
    return (origin?
      <div>
        <SimpleInformation
          label="Lieu de naissance"
          value={origin.birthPlace}
        />
        <SimpleInformation
          label="Diocèse"
          value={origin.diocese}
        />
        <SimpleListInformation
          label="Mouvement autours de Paris"
          value={origin.movesInOutParis}
        />
      </div>:<div>Pas d'informations</div>
    );
  }
}


export default injectSheet(styles)(Origin);
