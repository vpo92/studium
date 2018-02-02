//@flow
import React from 'react';

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
  return (
    props.value?
    <div className="app-detail-topic">
      <span className="app-detail-topic-label">{props.label} : </span>
      <span>{getValue(props.value)}</span>
    </div>
    :<div></div>
  );
};

export default SimpleInformation;
