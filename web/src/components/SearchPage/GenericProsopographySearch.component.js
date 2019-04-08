// @flow

import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';


import injectSheet from 'react-jss';

import styles from './SearchPage.style';

import localeData from './../../locales/messages.json';

const prosopographyEntries = {
  "identity": [
    "name",
    "nameVariant",
    "shortDescription",
    "datesOfLife",
    "datesOfActivity",
    "activityMediane",
    "gender",
    "status",
  ],
  "origin": [
    "birthPlace",
    "diocese",
    "movesInOutParis",
  ],
  "relationalInsertion": [
    "socialClassOrigin",
    "familyNetwork",
    "personalSocialClass",
    "personalServicesRelationship",
    "friends",
    "controversyOrDebates",
    "connectionsWith",
    "memberOfGroups",
    "politicalRelationships",
    "professionalRelationships",
    "willExecutor",
    "studentProfessorRelationships",
  ],
  "curriculum": [
    "preUniversity",
    "university",
    "grades",
    "universityCollege",
    "collegeFundations",
  ],
  "ecclesiasticalCareer": [
    "ecclesiasticalStatus",
    "secularPosition",
    "benefits",
    "regularOrder",
    "regularFunctions",
    "popFunctions",
    "otherFunctions",
    "communityFundations",
  ],
  "professionalCareer": [
    "professorOrPerceptor",
    "universityFunction",
    "lawFunction",
    "propertiesAdministrator",
    "townAdministrator",
    "culturalFunction",
    "kingdowChurchFunction",
    "kingdomCulturalFunction",
    "kingdomVariousFunction",
    "royalAdministration",
    "localAdministrationFunction",
    "representation",
    "business",
    "medicine",
    "otherJob",
  ],

  "politicalCareer": [
    "importantPosition",
    "jailed",
    "violentDeath",
    "exil",
    "justiceFacts",
  ],

  "travels": [
    "travels",
  ],
  "commissions": [
    "universityCommission",
    "otherCommission",
  ],
  "assets": [
    "parisHousing",
    "otherHousing",
    "incomes",
    "will",
    "gifts",
  ],
  "distinctiveSign": [
    "emblems",
    "seals",
  ],
  "orality": [
    "orality",
  ],
  "otherActivities": [
    "otherActivities",
  ],

};

const addOption = [
  {
    value: 'AND',
    label: 'et',
  },
  {
    value: 'OR',
    label: 'ou',
  },
  {
    value: 'NOT',
    label: 'différent de',
  },
];

const searchOption = [
  {
    value: 'CONTAINS',
    label: 'contient',
  },
  {
    value: 'EQUALS',
    label: 'égale à',
  },
];

export type LocalProps = {
  classes: any,
};

export type LocalState = {
  addOption: any,
  searchOption: any,
  chapter: any,
  subChapter: any,
};

class GenericProsopographySearch extends Component<LocalProps, LocalState> {



  constructor(props: LocalProps) {
    super(props);
    this.state = {
      addOption : "",
      searchOption: "",
      chapter: "",
      subChapter: "",
      value:"",
      operator:"",
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    },this.updateParentProsopography());

  };

  updateParentProsopography(){
    this.props.updateProsopography({
      "section":this.state.chapter,
      "subSection":this.state.subChapter,
      "matchType":this.state.searchOption,
      "value":this.state.value,
      "operator":this.state.addOption,
    });
  };

  getChapter = () => {
    return Object.keys(prosopographyEntries).map( (item: string) => {
      return {
        value: item,
        label: localeData.fr[item],
      };
    });
  }

  getSubChapter = (chapter: any) => {
    const values = prosopographyEntries[chapter];
    return values?values.map( (item: string) => {
      const k = localeData.fr[item];
      return {
        value: item,
        label: k,
      };
    }):[];
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid container spacing={8}>
        <Grid item xs={1}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="Gender"
              value={this.state.addOption}
              onChange={this.handleChange('addOption')}
            >
            {addOption.map(option => (
              <FormControlLabel value={option.value} control={<Radio />} label={option.label} />
            ))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={10}>
          <Paper>
            <Grid container spacing={16}>
              <Grid item xs={3}>
                <TextField id="select-chapter"
                    select
                    label="Rubrique"
                    value={this.state.chapter}
                    onChange={this.handleChange('chapter')}
                    margin="normal"
                    fullWidth
                  >
                    {this.getChapter().map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField id="select-sub-chapter"
                    select
                    label="Sous-rubrique"
                    value={this.state.subChapter}
                    onChange={this.handleChange('subChapter')}
                    margin="normal"
                    fullWidth
                  >
                    {this.getSubChapter(this.state.chapter).map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={2}>
                <FormControl component="fieldset">
                  <RadioGroup
                    aria-label="Gender"
                    value={this.state.searchOption}
                    onChange={this.handleChange('searchOption')}
                  >
                  {searchOption.map(option => (
                    <FormControlLabel value={option.value} control={<Radio />} label={option.label} />
                  ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Texte de recherche"
                  value={this.state.value}
                  onChange={this.handleChange('value')}
                  fullWidth/>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={1}>
          <IconButton color="secondary" className={classes.button} aria-label="Ajouter une ligne">
            <Icon>add_circle</Icon>
          </IconButton>
        </Grid>

      </Grid>
    );
  }
}

export default injectSheet(styles)(GenericProsopographySearch);
