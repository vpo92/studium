// @flow

import React, { Component } from 'react';
import Switch from 'material-ui/Switch';
import injectSheet from 'react-jss';

import styles from './DetailPage.style';

import { data } from './data';

type TopicType = {
  value?: string,
  showReference?: boolean,
  showComment?: boolean,
  reference?: string[],
  comment?: string[],
};

const TopicValue = (props: TopicType) => {
  return(
    <span>
      <span>{props.value}</span>
      {props.showReference && props.reference?<Reference value={props.reference} />:null}
      {props.showComment && props.comment?<Comment value={props.comment} />:null}
    </span>
  );
};

type TopicProps = {
  data: {
    label: string,
    value: TopicType[],
  },
}

const Topic = (props: TopicProps) => {
  return (
    <div className="app-detail-topic">
      <span className="app-detail-topic-label">{props.data.label} : </span>
      {Array.isArray(props.data.value)?
        <ul>
          {props.data.value.map((item, index) => {return (
            <li key={index}>
              <TopicValue value={item.value} comment={item.comment} reference={item.reference} showComment={true} showReference={true}/>
            </li>)})}
          </ul>
          :
          <TopicValue />
        }
      </div>
    );
  };

  const Comment = (props: {
    value: string[],
  }) => {return(
    <div className="app-detail-comment">
      <span className="app-detail-comment-label">Commentaire : </span>
      {props.value.length > 1 ?
        <ul>
          {props.value.map((item, index) => {return (<li key={index}>{item}</li>)})}
        </ul>
        :
        null
      }
    </div>
  )};

  const Reference = (props: {
    value: string[],
  }) => {return(
    <div className="app-detail-reference"><span className="app-detail-reference-label">Référence : </span>
    {Array.isArray(props.value)?
      <ul>
        {props.value.map((item, index) => {return (<li key={index}>{item}</li>)})}
      </ul>
      :
      <span>{props.value}</span>
    }
  </div>
)};

type Detail = {
  classes: any,
  match: {
    params: {
      id: string,
    }
  }
}

class DetailPage extends Component<Detail> {
  render() {
    return (
      <div className={this.props.classes.container}>
        <p><a href="#">retourner à la liste</a></p>
        <div className="app-search-toggle">
          <Switch aria-label="Afficher les commentaires" checked={true}/>
          <br />
          <Switch aria-label="Afficher les références" checked={true}/>
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

export default injectSheet(styles)(DetailPage);
