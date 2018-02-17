//@flow
import React from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';

function getDateValue(
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

function SimpleDateInformation(props: any) {
  return (
    <div className={props.classes.detailsTopic}>
      <span className={props.classes.detailsTopicLabel}>{props.label} : </span>
      <span>{getDateValue(props.value)}</span>
    </div>
  );
}

export default injectSheet(styles)(SimpleDateInformation);
