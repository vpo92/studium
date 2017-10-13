import React, { PropTypes, Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';

import SearchResult from '../../components/SearchResult';
import AdvanceSearch from './advancesearch';

const results = [{
    "id":"11546",
    "name":"ABRAHAM Alberti",
    "mediane":"1435",
    "status":"Maitre",
    "origine":"France"
  },
  {
    "id":"16792",
    "name":"ABSALON Absolonis",
    "mediane":"1256",
    "status":"Etudiant",
    "origine":"Italie"
  },
  {
    "id":"8925",
    "name":"ADAM Barate",
    "mediane":"1256",
    "status":"Etudiant",
    "origine":"Suède"
  }
];

const status = ["Maître","Gradué","Étudiant","Suppôt","Extérieur","Incertain"];
const grade = ["Magister","Docteur","Maître","Licencié","Bachelier","Étudiant"];


class SearchPage extends Component {
  state = {
    "status":1,
    "grade":1,
    "discipline":1,
    "advancesearch":false,
    activateCompleteSearchFeature:false
  }

  handleStatusChange = (event, index, value) => this.setState({status:value});
  handleGradeChange = (event, index, value) => this.setState({grade:value});
  handleDisciplineChange = (event, index, value) => this.setState({discipline:value});

  handleToogleChange = (event, index, value) => {
console.log(index);
console.log(value);
console.log(this.state.advancesearch);
    this.setState({advancesearch:!this.state.advancesearch})};

  render() {
    return (
    <div>
      <h1>Rechercher une fiche</h1>
      <TextField floatingLabelText="Saisissez un mot clé" className="app-search-field"/>
      <RaisedButton label="Rechercher" primary={true} />
      {this.state.activateCompleteSearchFeature ?
        <div>
          <div className="app-search-toggle">
            <Toggle label="Recherche avancée" value={this.state.advancesearch}  onClick={this.handleToogleChange}/>
          </div>
          {this.state.advancesearch ? <AdvanceSearch />:''}
      </div>
      : null
      }
      <h1>Résultats</h1>
      <SearchResult data={results}/>
    </div>
    );
  }
}

export default SearchPage;
