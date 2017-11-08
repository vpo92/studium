// @flow

import React, { PropTypes, Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';

import SearchResult from '../../components/SearchResult';
import AdvancedSearch from './AdvancedSearch.component';
import { searchByKeyWord } from '../../services/searchService';
import { type Search } from '../../actions/Search/searchTypes';

type State = {
  status: number,
  grade: number,
  discipline: number,
  advancesearch: boolean,
  activateCompleteSearchFeature: boolean,
  search: {
    keyWord: string,
  }
}

type Props = {
  handleKeyWordSearch: Function,
  search: Search
}

class SearchPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      status: 1,
      grade: 1,
      discipline: 1,
      advancesearch: false,
      activateCompleteSearchFeature: false,
      search: {
        keyWord: this.props.search.keyWord,
      },
    };
  }

  handleSearchField = (event: Event) => {
    const {target} = event;
    if (target instanceof HTMLInputElement) {
      this.setState({search: {...this.state.search, keyWord: target.value}});
    }
  }

  handleSearch = () => {
    this.props.handleKeyWordSearch(this.state.search.keyWord);
  }

  handleToogleChange = (event: Event, index: number, value: string) => {
    this.setState({ advancesearch: !this.state.advancesearch });
  };

  render() {
    return (
      <div>
        <h1>Rechercher une fiche</h1>
        <TextField
          floatingLabelText="Saisissez un mot clé"
          className="app-search-field"
          value={this.state.search.keyWord}
          onChange={this.handleSearchField}
        />
        <RaisedButton label="Rechercher" primary={true} onClick={this.handleSearch} />
        {this.state.activateCompleteSearchFeature ? (
          <div>
            <div className="app-search-toggle">
              <Toggle
                label="Recherche avancée"
                value={this.state.advancesearch}
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

export default SearchPage;
