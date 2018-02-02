//@flow
import React from 'react';

function getDateValue(
  date: ?{
    from: string,
    to: string,
  },
  addParenthesis: boolean = false
) {
  if (date) {
    const formattedDate = `${date.from} - ${date.to}`;
    return addParenthesis ? `(${formattedDate})` : formattedDate;
  }
  return '';
}

const SimpleDateInformation = (props: any) => {
  return (
    <div className="app-detail-topic">
      <span className="app-detail-topic-label">{props.label} : </span>
      <span>{getDateValue(props.value)}</span>
    </div>
  );
};

export default SimpleDateInformation;
