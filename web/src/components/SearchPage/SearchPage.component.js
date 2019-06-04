// @flow

import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SearchResult from '../SearchResult/SearchResult.component';
import AdvancedSearch from './AdvancedSearch.component';
import { withStyles } from '@material-ui/core/styles';
import { type State, type Props } from './SearchPage.types';
import styles from './SearchPage.style';

class SearchPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
<<<<<<< HEAD
      advancesearch: true,
=======
      advancesearch: false,
>>>>>>> feat(web) advance search v0
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
        <Paper className={this.props.classes.paper}>
          <Typography variant="title" color="inherit">Rechercher une fiche</Typography>
          <FormGroup row>
             {this.state.activateCompleteSearchFeature ? (
               <FormControlLabel
                  control={
                    <Switch
                      aria-label="Mode de recherche avancée"
                      checked={this.state.advancesearch}
                      onClick={this.handleToogleChange}
                    />
                  }
                  label="Mode de recherche avancée"
                />
             ) : null}
           </FormGroup>
          {!this.state.advancesearch?(
            <div>
<<<<<<< HEAD
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
=======
              <TextField
               label="Recherche plein texte"
               value={this.state.search.keyword}
               onChange={this.handleSearchField}
               InputLabelProps={{
                 shrink: true,
               }}
               placeholder="Saisissez un mot clé"
               className={this.props.classes.fullSearchField}
               margin="normal"
             />
             <Button variant="contained" color="primary" onClick={this.handleSearch}>Rechercher</Button>
           </div>
          ): <AdvancedSearch />}
        </Paper>
        {(this.props.search.prosopographies && this.props.search.prosopographies.length > 0)?(
        <Paper className={this.props.classes.paper}>
          <SearchResult data={this.props.search.prosopographies} />
        </Paper>
        ) : null}
>>>>>>> feat(web) advance search v0
      </div>
    );
  }
}

export default withStyles(styles)(SearchPage);
