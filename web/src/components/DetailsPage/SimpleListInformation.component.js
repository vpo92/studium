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

const SimpleListInformation = (props: any) => {

  return (
    props.value?
    <div className="app-detail-topic">
      <span className="app-detail-topic-label">{props.label} : </span>
      <ul>
        {props.value.map(item => {
          return <li key={getValue(item)}>{getValue(item)}</li>
        })}
      </ul>
    </div>
    :<div></div>
  );
};

export default SimpleListInformation;
