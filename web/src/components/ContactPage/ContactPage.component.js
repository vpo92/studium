// @flow

import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import injectSheet from 'react-jss';

import style from './ContactPage.style';

class ContactPage extends Component<{classes: any}> {
  render() {
    return (
    <div className={this.props.classes.container}>
      <h1>Équipe</h1>
      <Divider />
      <p>Directeurs du projet :	Jean-Philippe GENET et Thierry KOUAME.</p>
      <p>Collaborateurs : Stéphane LAMASSE, Elisabeth MORNET, Pierre-Henri BILLY, Georges-Xavier BLARY.</p>
      <p>Développement informatique:	Hicham IDABAL.</p>
      <p>Ingénieurs de saisie : Claire PRIOL et Anne TOURNIEROUX.</p>

      <h1>Contact</h1>
      <Divider />
      <p>StudiumParisiense@gmail.com</p>
    </div>
    );
  }
}

export default injectSheet(style)(ContactPage);
