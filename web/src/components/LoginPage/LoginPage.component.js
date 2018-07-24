// @flow

import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import injectSheet from 'react-jss';

import styles from './LoginPage.style';

class LoginPage extends Component<{classes: any}> {

  render() {
    return (
    <div className={this.props.classes.container}>
      <h3>Connexion</h3>
      <TextField helperLabelText="Login"/><br />
      <TextField helperLabelText="Password" type="password"/><br />
      <Button raised >
        Se connecter
      </Button>
    </div>
    );
  }
}

export default injectSheet(styles)(LoginPage);
