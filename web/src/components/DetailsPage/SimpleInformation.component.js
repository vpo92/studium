//@flow
import React from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';

function getValue(topic: ?{value: any,}) {
  if (topic && topic.value) {
    //Remove special chars
    return topic.value.replace(/[&$£%*/]/gi, '');
  }
  return '';
}

function isComment(topic) {
  return (topic && topic.meta && topic.meta.isComment);
}

function isLink(topic) {
  return (topic && topic.meta && topic.meta.isLink);
}

const SimpleInformation = (props: any) => {
  return props.value ? (
    <div className={props.classes.detailsTopic}>
      <span className={props.classes.detailsTopicLabel}>{props.label} : </span>
      {
        isLink(props.value)?(
          <span className={props.classes.linkLabel}><a href="{getValue(props.value)}">{getValue(props.value)}</a></span>
        ):(
          <span className={isComment(props.value)?props.classes.commentLabel:null}>{getValue(props.value)}</span>
        )
      }

    </div>
  ) : null ;
};

export default injectSheet(styles)(SimpleInformation);
