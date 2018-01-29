// @flow

import React from 'react';

const Reference = (props: { value: string[] }) => {
  return (
    <div className="app-detail-reference">
      <span className="app-detail-reference-label">Référence : </span>
      {Array.isArray(props.value) ? (
        <ul>
          {props.value.map((item, index) => {
            return <li key={index}>{item}</li>;
          })}
        </ul>
      ) : (
        <span>{props.value}</span>
      )}
    </div>
  );
};

export default Reference;
