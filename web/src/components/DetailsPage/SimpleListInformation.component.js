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

const SimpleListInformation = (props: any) => {

  return (
    props.value?
    <div className={props.classes.detailsTopic}>
      <span className={props.classes.detailsTopicLabel}>{props.label} : </span>
      <ul>
        {props.value.map(item => {
          return <li key={getValue(item)}>{getValue(item)}</li>
        })}
      </ul>
    </div>
    :<div></div>
  );
};

export default injectSheet(styles)(SimpleListInformation);
