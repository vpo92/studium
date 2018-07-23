//@flow
import React from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';

function getValue(
  topic: ?{
    value: any,
  }
) {
  if (topic && topic.value) {
    //Remove special chars
    return topic.value.replace(/[&$£%*/]/gi, '');
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
