import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

class LoginPage extends Component {

  render() {
    return (
    <div className="app-text-center">
      <h3>Connexion</h3>
      <TextField floatingLabelText="Login"/><br />
      <TextField floatingLabelText="Password" type="password"/><br />
      <RaisedButton primary={true} label="Se connecter"/>
    </div>
    );
  }
}

export default LoginPage;
