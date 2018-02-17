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
        keyword: this.props.search.keyword,
      },
    };
  }

  handleSearchField = (event: SyntheticInputEvent<HTMLElement>) => {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.setState({
        search: { ...this.state.search, keyword: target.value },
      });
    }
  };

  handleSearch = () => {
    this.props.handleKeywordSearch(this.state.search.keyword);
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
          value={this.state.search.keyword}
          onChange={this.handleSearchField}
        />
        <Button raised color="primary" onClick={this.handleSearch}>
          Rechercher
        </Button>
        {this.state.activateCompleteSearchFeature ? (
          <div>
            <div>
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
        <SearchResult data={this.props.search.prosopographies} />
      </div>
    );
  }
}

export default injectSheet(styles)(SearchPage);
