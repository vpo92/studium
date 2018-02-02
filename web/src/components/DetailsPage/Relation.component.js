// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';
import SimpleInformation from './SimpleInformation.component';
import SimpleListInformation from './SimpleListInformation.component';

type Props = {
  classes: any,
  relationalInsertion: Object,
};

function getValue(
  topic: ?{
    value: any,
  }
) {
  if (topic) {
    return topic.value;
  }
  return '';
}

const RelationList = (props: any) => {
  return (props.value?
    <div className="app-detail-topic">
      <span className="app-detail-topic-label">{props.label}</span>
      <ul>
        {props.value.map(item => {
          return <li key={getValue(item.name)}>{getValue(item.name)} {item.type?`(${item.type})`:''}</li>
        })}
      </ul>
    </div>
    :<div></div>
  )
}


class RelationalInsertion extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { relationalInsertion } = this.props;
    //FIXME : stringify...
    return (
      relationalInsertion && JSON.stringify(this.props.relationalInsertion)!=="{}"?
      <div>
        <SimpleInformation
          label="Classe sociale d'origine"
          value={relationalInsertion.socialClassOrigin}
        />
        <RelationList
          label="Réseau familial"
          value={relationalInsertion.familyNetwork} />
        <SimpleInformation
          label="Classe sociale personnelle"
          value={relationalInsertion.personalSocialClass}
        />
        <RelationList
          label="Relation de service personnelle"
          value={relationalInsertion.personalServicesRelationship} />
        <RelationList
          label="Ami de ou ennemi de"
          value={relationalInsertion.friendsOrEnemies} />
        <SimpleListInformation
          label="Impliqué dans une polémique ou dans un débat intellectuel"
          value={relationalInsertion.controversyOrDebates}/>
        <SimpleListInformation
          label="Entretient une correspondance suivie avec quelqu’un."
          value={relationalInsertion.connectionsWith}/>
        <SimpleListInformation
          label="Appartient à un groupe particulier"
          value={relationalInsertion.memberOfGroups}/>
        <SimpleListInformation
          label="Liens politiques particuliers."
          value={relationalInsertion.politicalRelationships}/>
        <SimpleListInformation
          label="Relations professionnelles"
          value={relationalInsertion.professionalRelationships}/>
        <SimpleInformation
          label="Executeur testamentaire"
          value={relationalInsertion.willExecutor}/>
        <SimpleListInformation
          label="Lien maître-élève"
          value={relationalInsertion.studentProfessorRelationships}/>
      </div>
      :<div>Pas d'informations</div>
    );
  }
}

export default injectSheet(styles)(RelationalInsertion);
