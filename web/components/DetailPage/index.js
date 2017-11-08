import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import MenuItem from 'material-ui/MenuItem';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const data={
  "variantes":{
    "label":"Variantes du nom",
    "value":{value:"Adam de BRANA"}
  },
  "descriptifCourt":{
    "label":"Descriptif court",
    "value":{value:"Licencié en droit civil"}
  },
  "periodeActivite":{
    "label":"Période d'activité",
    "value":{value:"1379-1379"}
  },
  "statut":{
    "label":"Statut",
    "value":{value:"Étudiant"}
  },
  "origine":{
    "label":"Origine",
    "value":{value:"Picardie ? Diocèse de Laon ."}
  },
  "universite" : {
    "label" :"Université ou studium fréquenté",
    "value":[{value:"Paris (Faculté de décret ) 1379",
            reference: "COURTENAY: III (1), 337.",
            comment:"Il a acquis son grade en droit civil dans un autre université, sans doute Orléans ."
          }]
  },
  "cursus" : {
    "label" : "Cursus",
    "value" : [
      {
        value:"Licencié en droit civil (?Orléans)",
        reference: "COURTENAY: III (1), 337."
      },
      {
        value:"Étudiant en droit canon (Paris).",
        commentaire: "Il figure à ce titre sur le rotulus de 1379",
        reference:["CUP: III 277 ;","COURTENAY: III (1), 337."]
      }
    ]
  },
  "positionEcclesiastiques" : {
    "label" : "Positions ecclésiastiques",
    "value" : {
      "value" : "Candidat à un canonicat avec expectative de prébende à Beauvais ",
      "reference" : "COURTENAY: III (1), 337."
    }
  },
  "productionTextuelle" : {
    "label" : "Production textuelle",
    "value" : {
      "value" : "Pas d œuvres connues"
    }
  }
}

const TopicValue = (props) =>{
  return(
    <span>
      <span>{props.value}</span>
      {props.showReference && props.reference?<Reference value={props.reference} />:null}
      {props.showComment && props.comment?<Comment  value={props.comment} />:null}
    </span>
  );
};

const Topic = (props) => {
  return (
  <div className="app-detail-topic">
    <span className="app-detail-topic-label">{props.data.label} : </span>
      {Array.isArray(props.data.value)?
        <ul>
          {props.data.value.map((item) => {return (
            <li>
              <TopicValue value={item.value} comment={item.comment} reference={item.reference} showComment={true} showReference={true}/>
            </li>)})}
        </ul>
        :
        <TopicValue value={props.data.value.value} comment={props.data.value.comment} reference={props.data.value.reference}  showComment={true} showReference={true}/>
      }
   </div>
 );
};
/*

FIXME : use pop-over instead of pure lines

*/
const Comment = (props) => {return(
  <div className="app-detail-comment">
    <span className="app-detail-comment-label">Commentaire : </span>
    {Array.isArray(props.value)?
    <ul>
      {props.value.map((item) => {return (<li>item</li>)})}
    </ul>
    :
    <span>{props.value}</span>
    }
  </div>
)};

const Reference = (props) => {return(
  <div className="app-detail-reference"><span className="app-detail-reference-label">Référence : </span>
    {Array.isArray(props.value)?
    <ul>
      {props.value.map((item) => {return (<li>{item}</li>)})}
    </ul>
    :
    <span>{props.value}</span>
    }
  </div>
)};

class DetailPage extends Component {

  render(props) {
    return (
    <div>

      <p><a href="#">retourner à la liste</a></p>
      <div className="app-search-toggle">
        <Toggle label="Afficher les commentaires" value={true}/><br />
        <Toggle label="Afficher les références" value={true}/>
      </div>
      <h1>ADAM de Brana</h1>
      <p>Identifiant : {this.props.match.params.id} </p>
      <Topic data={data.variantes} />
      <Topic data={data.descriptifCourt} />
      <Topic data={data.periodeActivite} />
      <Topic data={data.statut} />
      <Topic data={data.origine} />
      <Topic data={data.universite} />
      <Topic data={data.cursus} />
      <h4>Carrières ecclésiastiques :</h4>
      <Topic data={data.positionEcclesiastiques} />
      <Topic data={data.productionTextuelle} />
    </div>
    );
  }
}

export default DetailPage;
