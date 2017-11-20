import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import injectSheet from 'react-jss';

import styles from './ProfilPage.style';

class ProfilPage extends Component<{classes: any}> {

  render() {
    return (
    <div className={this.props.classes.container}>
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
      <TextField helperText="Mot de passe actuel" type="password"/><br />
      <TextField helperText="Nouveau mot de passe" type="password"/><br />
      <TextField helperText="Confirmer nouveau mot de passe" type="password"/><br />
      <Button raised >
        Valider
      </Button>
      </p>
    </div>
    );
  }
}

export default injectSheet(styles)(ProfilPage);
