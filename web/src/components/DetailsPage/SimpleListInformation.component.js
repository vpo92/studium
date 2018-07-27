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
    return topic.value.replace(/[&$£%*/]/gi, '');
  }
  return '';
}

function isComment(topic) {
  return (topic && topic.meta && topic.meta.isComment);
}

const SimpleListInformation = (props: any) => {

  return (
    props.value?
    <div className={props.classes.detailsTopic}>
      <span className={props.classes.detailsTopicLabel}>{props.label} : </span>
      <ul>
        {props.value.map(item => {
          return <li className={isComment(item)?props.classes.referenceLabel:null} key={getValue(item)}>{getValue(item)}</li>
        })}
      </ul>
    </div>
    :<div></div>
  );
};

export default injectSheet(styles)(SimpleListInformation);
