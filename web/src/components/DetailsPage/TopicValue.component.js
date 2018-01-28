// @flow

import React from 'react';

import Comment from './Comment.component';
import Reference from './Reference.component';

export type TopicType = {
  value?: string,
  showReference?: boolean,
  showComment?: boolean,
  reference?: string[],
  comment?: string[],
};

const TopicValue = (props: TopicType) => {
  return (
    <span>
      <span>{props.value}</span>
      {props.showReference && props.reference ? (
        <Reference value={props.reference} />
      ) : null}
      {props.showComment && props.comment ? (
        <Comment value={props.comment} />
      ) : null}
    </span>
  );
};

export default TopicValue;
