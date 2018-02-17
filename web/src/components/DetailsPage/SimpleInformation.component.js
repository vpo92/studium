//@flow
import React from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';

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

const SimpleInformation = (props: any) => {
  return props.value ? (
    <div className={props.classes.detailsTopic}>
      <span className={props.classes.detailsTopicLabel}>{props.label} : </span>
      <span>{getValue(props.value)}</span>
    </div>
  ) : (
    <div />
  );
};

export default injectSheet(styles)(SimpleInformation);
