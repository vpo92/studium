import React, { PropTypes, Component } from 'react';
import Paper from 'material-ui/Paper';

class ContactPage extends Component {

  render() {
    return (
    <Paper className="app-paper">
      <h1>Équipe</h1>
      <p>Directeurs du projet :	Jean-Philippe GENET et Thierry KOUAME.</p>
      <p>Collaborateurs : Stéphane LAMASSE, Elisabeth MORNET, Pierre-Henri BILLY, Georges-Xavier BLARY.</p>
      <p>Développement informatique:	Hicham IDABAL.</p>
      <p>Ingénieurs de saisie : Claire PRIOL et Anne TOURNIEROUX.</p>

      <h1>Contact</h1>
      <p>StudiumParisiense@gmail.com</p>
    </Paper>
    );
  }
}

export default ContactPage;
