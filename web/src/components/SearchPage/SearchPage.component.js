// @flow

import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';

import SearchResult from '../SearchResult/SearchResult.component';
import AdvancedSearch from './AdvancedSearch.component';
import { withStyles } from '@material-ui/core/styles';

import { type State, type Props } from './SearchPage.types';
import styles from './SearchPage.style';

class SearchPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      advancesearch: true,
      activateCompleteSearchFeature: true,
      search: {
        keyword: this.props.search.keyword,
        searchRequest: this.props.search.searchRequest,
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

  handleSearchAdvanced = (searchRequest) => {
    console.log(searchRequest);
    /**
    let searchRequest = {
    	"prosopography":[{
      	  "section":"identity",
      	  "subSection":"gender",
      	  "operator":"AND",
      	  "matchType":"EXACT",
      	  "value":"female"
      	},]
    };*/
    this.props.handleAdvancedSearch(searchRequest);
  }

  handleToogleChange = () => {
    this.setState({ advancesearch: !this.state.advancesearch });
  };

  render() {
    return (
      <div className={this.props.classes.container}>
        <h1>Rechercher une fiche</h1>
        <div>
          <TextField
           label="Recherche plein texte"
           value={this.state.search.keyword}
           onChange={this.handleSearchField}
           InputLabelProps={{
             shrink: true,
           }}
           placeholder="Saisissez un mot clé"
           fullWidth
           margin="normal"
         />
       </div>
       <div>
         <Button variant="contained" color="primary" onClick={this.handleSearch}>Rechercher</Button>
       </div>

        {this.state.activateCompleteSearchFeature ? (
          <div>
            <div>
              <Switch
                aria-label="Recherche avancée"
                checked={this.state.advancesearch}
                onClick={this.handleToogleChange}
              />
            </div>
            {this.state.advancesearch ? <AdvancedSearch handleSearch={this.handleSearchAdvanced}/> : ''}
          </div>
        ) : null}
        <SearchResult data={this.props.search.prosopographies}/>
      </div>
    );
  }
}

export default withStyles(styles)(SearchPage);
