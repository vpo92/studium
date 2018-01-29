// @flow

import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';

import SearchResult from '../SearchResult/SearchResult.component';
import AdvancedSearch from './AdvancedSearch.component';
import injectSheet from 'react-jss';

import { type State, type Props } from './SearchPage.types';
import styles from './SearchPage.style';

class SearchPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      advancesearch: false,
      activateCompleteSearchFeature: false,
      search: {
        keyWord: this.props.search.keyWord,
      },
    };
  }

  handleSearchField = (event: SyntheticInputEvent<HTMLElement>) => {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.setState({
        search: { ...this.state.search, keyWord: target.value },
      });
    }
  };

  handleSearch = () => {
    this.props.handleKeyWordSearch(this.state.search.keyWord);
  };

  handleToogleChange = () => {
    this.setState({ advancesearch: !this.state.advancesearch });
  };

  render() {
    return (
      <div className={this.props.classes.container}>
        <h1>Rechercher une fiche</h1>
        <TextField
          helperText="Saisissez un mot clé"
          className="app-search-field"
          value={this.state.search.keyWord}
          onChange={this.handleSearchField}
        />
        <Button raised color="primary" onClick={this.handleSearch}>
          Rechercher
        </Button>
        {this.state.activateCompleteSearchFeature ? (
          <div>
            <div className="app-search-toggle">
              <Switch
                aria-label="Recherche avancée"
                checked={this.state.advancesearch}
                onClick={this.handleToogleChange}
              />
            </div>
            {this.state.advancesearch ? <AdvancedSearch /> : ''}
          </div>
        ) : null}
        <h1>Résultats</h1>
        <SearchResult data={this.props.search.result} />
      </div>
    );
  }
}

export default injectSheet(styles)(SearchPage);
