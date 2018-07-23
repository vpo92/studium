// @flow

import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';

import injectSheet from 'react-jss';

import styles from './SearchPage.style';


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
      addOption : addOption,
      searchOption: searchOption,
      chapter: "",
      subChapter: "",
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  getChapter = () => {
    return [
      {
        value: 'chaptire1',
        label: 'Chapitre 1',
      },
      {
        value: 'chapitre2',
        label: 'Chapitre 2',
      },
    ];
  }

  getSubChapter = (chapter: string) => {
    return [
      {
        value: 'chaptire1',
        label: 'Chapitre 1'+chapter,
      },
      {
        value: 'chapitre2',
        label: 'Chapitre 2'+chapter,
      },
    ];
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <p>
        <TextField id="select-add-option"
            select
            label="Option de combinaison de ligne"
            className={classes.textField}
            value={this.state.addOption}
            onChange={this.handleChange('addOption')}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
          >
            {addOption.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </TextField>
        </p>
        <p>
        <TextField id="select-chapter"
            select
            label="Rubrique"
            className={classes.textField}
            value={this.state.chapter}
            onChange={this.handleChange('chapter')}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
          >
            {this.getChapter().map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </TextField>
      </p>
      <p>
        <TextField id="select-sub-chapter"
            select
            label="Sous-rubrique"
            className={classes.textField}
            value={this.state.subChapter}
            onChange={this.handleChange('subChapter')}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
          >
            {this.getSubChapter(this.state.chapter).map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </TextField>
      </p>
      <p>
        <TextField id="select-search-option"
            select
            label="Option de recherche de texte"
            className={classes.textField}
            value={this.state.searchOption}
            onChange={this.handleChange('searchOption')}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
          >
            {searchOption.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </TextField>
      </p>
      </div>
    );
  }
}

export default injectSheet(styles)(GenericProsopographySearch);
