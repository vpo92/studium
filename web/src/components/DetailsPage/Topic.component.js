// @flow

import React from 'react';

type TopicProps = {
  value: string,
  label: string,
};

const Topic = (props: TopicProps) => {
  return (
    <div className="app-detail-topic">
      <span className="app-detail-topic-label">{props.label} : </span>
      <span>{props.value}</span>
    </div>
  );
};

export default Topic;
