// @flow

import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import injectSheet from 'react-jss';
import Paper from '@material-ui/core/Paper';
import styles from './LoginPage.style';

class LoginPage extends Component<{classes: any}> {

  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loggedIn: this.props.loggedIn,
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleLogin = () => {
    this.props.handleLogin(this.state.username, this.state.password);
  };

  render() {
    return this.props.loggedIn?(
      <div className={this.props.classes.container}>Vous êtes connecté à Studium !</div>
      ):(

        <div className={this.props.classes.container}>
        <Paper className={this.props.classes.loginPaper}>
          <h3>Connexion à Studium</h3>
          <TextField
            label="Identifiant"
            value={this.state.username}
            onChange={this.handleChange('username')}/><br />
          <TextField
            label="Mot de passe"
            value={this.state.password}
            onChange={this.handleChange('password')}
            type="password"/><br />
          <Button
            className={this.props.classes.loginButton}
            variant="contained"
            color="primary"
            onClick={this.handleLogin}>
            Se connecter
          </Button>
        </Paper>
        </div>
    );
  }
}

export default injectSheet(styles)(LoginPage);
