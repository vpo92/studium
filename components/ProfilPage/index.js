import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class ProfilPage extends Component {

  render() {
    return (
    <div>
      <h1>Mon profil</h1>
      <Divider />
      <p>
        Nom : Poupet
      </p>
      <p>
        Prénom : Vincent
      </p>
      <p>
        Rôle(s) : Informaticien
      </p>
      <Divider />
      <h3>Changer de mot de passe</h3>
      <p>
      <TextField hintText="Mot de passe actuel" floatingLabelText="Mot de passe actuel" type="password"/><br />
      <TextField hintText="Nouveau mot de passe" floatingLabelText="Nouveau mot de passe" type="password"/><br />
      <TextField hintText="Confirmer nouveau mot de passe" floatingLabelText="Confirmer nouveau mot de passe" type="password"/><br />
      <RaisedButton label="Valider" primary={true} />
      </p>
    </div>
    );
  }
}

export default ProfilPage;
