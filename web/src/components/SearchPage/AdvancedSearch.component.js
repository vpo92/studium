// @flow

import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import GenericProsopographySearch from './GenericProsopographySearch.component';
import Grid from '@material-ui/core/Grid';

const disciplines = [
  {code:"ALL",label:"Tous"},
  {code:"ART",label:"Art"},
  {code:"DROIT",label:"Droit"},
  {code:"DROIT_CANON",label:"Droit canon"},
  {code:"DROIT_CIVIL",label:"Droit civil"},
  {code:"MEDECINE",label:"Médecine"},
  {code:"MUSIQUE",label:"Musique"},
];

const grades = [
{code:"ALL",label:"Tous"},
{code:"MAGIS",label:"Magister"},
{code:"DR",label:"Docteur"},
{code:"MAITRE",label:"Maître"},
{code:"LIC",label:"Licencié"},
{code:"BAC",label:"Bachelier"},
{code:"ETU",label:"Étudiant"},
];

const status = [
{code:"ALL",label:"Tous"},
{code:"MAITRE",label:"Maître"},
{code:"GRADUE",label:"Gradué"},
{code:"ETU",label:"Étudiant"},
{code:"SUP",label:"Suppôt"},
{code:"EXT",label:"Extérieur"},
{code:"INC",label:"Incertain"},
];



type State = {
  status: number,
  grade: number,
  discipline: number,
};

class AdvanceSearch extends Component<{}, State> {
  constructor(props) {
    console.log(props);
    super(props);
    //this.handleSearch = this.handleSearch.bind(this);
    this.state = {
      name: '',
      status: "ALL",
      grade: "ALL",
      discipline: "ALL",
      prosopography:{},
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  localHandleSearch = () => {
    this.props.handleSearch(this.state);
  }

  updateProsopography = (p) => {
    this.setState({
      ...this.state,
      prosopography:[p],
      });
  }

  render() {
    return (
      <div>
          <br/>
          <br/>
          <Typography variant="subheading" color="secondary">Identité</Typography>
          <TextField
            id="select-add-option"
            label="Une partie du nom"
            value={this.state.name}
            onChange={this.handleChange('name')}
          />
          <br/>
          <br/>
          <Typography variant="subheading" color="secondary">Activité</Typography>
          <p>
            Médiane d'activité Ou Début et Fin d'activité
          </p>
          <br/>
          <br/>
          <Typography variant="subheading" color="secondary">Cursus</Typography>
          <Grid container spacing={8}>
            <Grid item xs={4}>
              <TextField
                id="select-status"
                select
                label="Status"
                value={this.state.status}
                onChange={this.handleChange('status')}
                fullWidth
              >
                {status.map(option => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <Select
                label="Grade obtenu"
                value={this.state.grade}
                onChange={this.handleChange('grade')}
                fullWidth
              >
              {grades.map(option => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
              </Select>
            </Grid>
            <Grid item xs={4}>
              <Select
                label="Discipline"
                value={this.state.discipline}
                onChange={this.handleChange('discipline')}
                fullWidth
              >
              {disciplines.map(option => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
              </Select>
            </Grid>
        </Grid>
        <br/>
        <br/>
        <Typography variant="subheading" color="secondary">Prosopographie</Typography>
        <GenericProsopographySearch updateProsopography={this.updateProsopography} />
        <br/>
        <br/>
        <Button variant="contained" color="primary" onClick={this.localHandleSearch}>Rechercher</Button>
      </div>
    );
  }
}

export default AdvanceSearch;
