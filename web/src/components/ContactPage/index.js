import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';

class ContactPage extends Component {

  render() {
    return (
    <div className="app-text-big">
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

export default ContactPage;
