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

function isLink(topic) {
  return (topic && topic.meta && topic.meta.isLink);
}

const SimpleListInformation = (props: any) => {

  return (
    props.value?
    <div className={props.classes.detailsTopic}>
      <span className={props.classes.detailsTopicLabel}>{props.label} : </span>
      <ul>
        {props.value.map(item => {

          if(isLink(item)){
            return <li className={props.classes.linkLabel}><a href="{getValue(props.value)}">{getValue(props.value)}</a></li>;
          }else{
            return <li className={isComment(item)?props.classes.commentLabel:null} key={getValue(item)}>{getValue(item)}</li>
          }

        })}
      </ul>
    </div>
    :<div></div>
  );
};

export default injectSheet(styles)(SimpleListInformation);
