// @flow

import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import GenericProsopographySearch from './GenericProsopographySearch.component';

type State = {
  status: number,
  grade: number,
  discipline: number,
};

class AdvanceSearch extends Component<{}, State> {
  constructor() {
    super();
    this.state = {
      status: 1,
      grade: 1,
      discipline: 1,
    };
  }

  handleChange = (stateKey: string) => (
    event: Event,
    index: number,
    value: number
  ) => this.setState({ [stateKey]: value });

  handleStatusChange = this.handleChange('status');
  handleGradeChange = this.handleChange('grade');
  handleDisciplineChange = this.handleChange('discipline');

  render() {
    return (
      <div>
        <h1>Recherche avancée</h1>
        <p>

          <h4>Identité</h4>
          <p>
            Une partie du nom : <TextField />
          </p>
          <h4>Activité</h4>
          <p>
            Médiane d'activité Ou Début et Fin d'activité
          </p>
          <h4>Cursus</h4>
          <Select
            helperText="Status"
            value={this.state.status}
            onChange={this.handleStatusChange}
          >
            <MenuItem value={0} primaryText="Never" />
            <MenuItem value={1} primaryText="Every Night" />
            <MenuItem value={2} primaryText="Weeknights" />
          </Select>
          <Select
            helperText="Grade obtenu"
            value={this.state.grade}
            onChange={this.handleGradeChange}
          >
            <MenuItem value={0} primaryText="Never" />
            <MenuItem value={1} primaryText="Every Night" />
            <MenuItem value={2} primaryText="Weeknights" />
          </Select>
          <Select
            helperText="Discipline"
            value={this.state.discipline}
            onChange={this.handleDisciplineChange}
          >
            <MenuItem value={0} primaryText="Never" />
            <MenuItem value={1} primaryText="Every Night" />
            <MenuItem value={2} primaryText="Weeknights" />
          </Select>

          <h4>Prosopography</h4>
          <GenericProsopographySearch />

        </p>
      </div>
    );
  }
}

export default AdvanceSearch;
