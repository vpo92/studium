// @flow

import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import injectSheet from 'react-jss';
import Paper from '@material-ui/core/Paper';


import styles from './LoginPage.style';

class LoginPage extends Component<{classes: any}> {

  render() {
    return (

        <div className={this.props.classes.container}>
        <Paper className={this.props.classes.loginPaper}>
          <h3>Connexion à Studium</h3>
          <TextField label="Identifiant" helperText=""/><br />
          <TextField label="Mot de passe" helperText="" type="password"/><br />
          <Button className={this.props.classes.loginButton} variant="contained" color="primary" >
            Se connecter
          </Button>
        </Paper>
        </div>
    );
  }
}

export default injectSheet(styles)(LoginPage);
