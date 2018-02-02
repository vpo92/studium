// @flow

import React from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';
import SimpleInformation from './SimpleInformation.component';
import SimpleListInformation from './SimpleListInformation.component';

const Origin = (props: any) => {
    //FIXME : stringify...
    return (props.origin?
      <div>
        <SimpleInformation
          label="Lieu de naissance"
          value={props.origin.birthPlace}
        />
        <SimpleInformation
          label="Diocèse"
          value={props.origin.diocese}
        />
        <SimpleListInformation
          label="Mouvement autours de Paris"
          value={props.origin.movesInOutParis}
        />
      </div>:<div>Pas d'informations</div>
    );
}


export default injectSheet(styles)(Origin);
