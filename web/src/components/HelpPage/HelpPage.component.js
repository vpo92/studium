// @flow

import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import injectSheet from 'react-jss';

import styles from './HelpPage.style';

class ContactPage extends Component<{classes: any}> {

  render() {
    return (
      <div className={this.props.classes.container}>
        <h1>Aide et documentation</h1>
        <Divider />
        <h3>L'état de la base est renseigné par les documents qui suivent :</h3>
        <ul>
          <li>Liste des répertoires biographiques et des travaux de recherche dépouillés pdf</li>
          <li>Liste des répertoires biographiques et des travaux prosopographiques revus et intégrés au cours du projet SAS pdf</li>
        </ul>
        <Divider />
        <h3>La consultation de la base est facilitée par ces fichiers annexes</h3>
        <ul>
          <li>Les règles de rédaction des fiches biobibliographiques pdf</li>
          <li>La liste des abréviations utilisées dans la bibliographie pdf</li>
        </ul>
      </div>
    );
  }
}

export default injectSheet(styles)(ContactPage);
