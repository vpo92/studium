import React, { PropTypes, Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const status = ["Maître","Gradué","Étudiant","Suppôt","Extérieur","Incertain"];
const grade = ["Magister","Docteur","Maître","Licencié","Bachelier","Étudiant"];

class AdvanceSearch extends Component {
  constructor() {
    super();
    this.state = {
      "status":1,
      "grade":1,
      "discipline":1
    }
  }

  handleStatusChange = (event, index, value) => this.setState({status:value});
  handleGradeChange = (event, index, value) => this.setState({grade:value});
  handleDisciplineChange = (event, index, value) => this.setState({discipline:value});

  render() {
    return (
      <div>
        <h1>Recherche avancée</h1>
        <p>
          Une partie du nom : <TextField />
          <Divider />
          Médiane d'activité
          Ou
          Début et Fin d'activité
          <Divider />
          <h4>Cursus</h4>
          <SelectField floatingLabelText="Status" value={this.state.status} onChange={this.handleStatusChange}>
            <MenuItem value={0} primaryText="Never" />
            <MenuItem value={1}  primaryText="Every Night" />
            <MenuItem value={2}  primaryText="Weeknights" />
          </SelectField>
          <SelectField floatingLabelText="Grade obtenu" value={this.state.grade} onChange={this.handleGradeChange}>
            <MenuItem value={0} primaryText="Never" />
            <MenuItem value={1}  primaryText="Every Night" />
            <MenuItem value={2}  primaryText="Weeknights" />
          </SelectField>
          <SelectField floatingLabelText="Discipline" value={this.state.discipline} onChange={this.handleDisciplineChange}>
            <MenuItem value={0} primaryText="Never" />
            <MenuItem value={1}  primaryText="Every Night" />
            <MenuItem value={2}  primaryText="Weeknights" />
          </SelectField>
          <Divider />
          Biographie :
          <Divider />
          Production textuelle :
          <Divider />
          Bibliographie :
          <Divider />
        </p>
      </div>
    );
  }
}

export default AdvanceSearch;
