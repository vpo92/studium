// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { Link } from 'react-router-dom';

import styles from './DetailsPage.style';
import Topic from './Topic.component';

import { type Prosopography } from '../../actions/Search/searchTypes';

type Props = {
  classes: any,
  prosopography: ?Prosopography,
  reference: number,
  getDetails: (reference: number) => void,
};

function displayValue(
  topic: ?{
    value: any,
  }
) {
  if (topic) {
    return topic.value;
  }
  return '';
}

function displayDate(
  date: ?{
    from: string,
    to: string,
  },
  addParenthesis: boolean = false
) {
  if (date) {
    const formattedDate = `${date.from} - ${date.to}`;
    return addParenthesis ? `(${formattedDate})` : formattedDate;
  }
  return '';
}

class DetailsPage extends Component<Props> {
  constructor(props: Props) {
    super(props);
    props.getDetails(props.reference);
  }

  render() {
    const { prosopography } = this.props;
    return (
      <div className={this.props.classes.container}>
        <p>
          <Link to="/recherche">Retourner à la liste</Link>
        </p>
        {prosopography ? (
          <div>
            <h1>
              {`${displayValue(prosopography.identity.name)} ${displayDate(
                prosopography.identity.datesOfLife,
                true
              )}`}
            </h1>
            <p>Identifiant : {prosopography._id} </p>
            <Topic
              label="Variantes du nom"
              value={
                prosopography.identity.nameVariant
                  ? prosopography.identity.nameVariant
                      .map(name => `${displayValue(name)}`)
                      .join(', ')
                  : ''
              }
            />
            <Topic
              label="Genre"
              value={displayValue(prosopography.identity.gender)}
            />
            <Topic
              label="Descriptif court"
              value={displayValue(prosopography.identity.description)}
            />
            <Topic
              label="Période d'activité"
              value={`${displayDate(prosopography.identity.datesOfActivity)}`}
            />
            <Topic
              label="Statut"
              value={displayValue(prosopography.identity.status)}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default injectSheet(styles)(DetailsPage);
