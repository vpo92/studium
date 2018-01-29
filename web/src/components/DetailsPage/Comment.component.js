// @flow

import React from 'react';

const Comment = (props: { value: string[] }) => {
  return (
    <div className="app-detail-comment">
      <span className="app-detail-comment-label">Commentaire : </span>
      {props.value.length > 1 ? (
        <ul>
          {props.value.map((item, index) => {
            return <li key={index}>{item}</li>;
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default Comment;
