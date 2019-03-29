// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import styles from './EditPage.style';

type Props = {
  classes: any
};

type State = {
  reference: string,
};

class EditPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      inputTxt : '',
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleSave = () => {
    this.props.handleSave(this.state.inputTxt);
  }

  render() {
    return (
      <div className={this.props.classes.container}>
          <h1>Editer une fiche</h1>

          <TextField
            id="standard-multiline-static"
            label="Zone d'édition de la fiche"
            multiline
            fullWidth
            rows="10"
            className={this.props.classes.prosopographyTextInput}
            margin="normal"
            variant="outlined"
            placeholder="Renseigner la fiche au format TXT ici"
            value={this.state.inputTxt}
            onChange={this.handleChange('inputTxt')}
          />

          <Button
            className={this.props.classes.saveButton}
            variant="contained"
            color="primary"
            onClick={this.handleSave}>
            Enregistrer la fiche
          </Button>


      </div>
    );
  }
}

export default injectSheet(styles)(EditPage);
