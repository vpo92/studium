// @flow


import type {
  ProsopographyRow,
  ParsedLine,
} from './types.js';

export function addPropToRecord(record: $Shape<ProsopographyRow>, parsedLine: ParsedLine): $Shape<ProsopographyRow> {
  let k = Object.keys(parsedLine.value)[0];
  if(record[k]){
    let v = record[k];
    if(v instanceof Array){
      v.push(parsedLine.value)
    }else{
      record[k] = [v];
      record[k].push(parsedLine.value[k])
    }
    //return record;
  }else{
    record[k] = parsedLine.value[k];
    /***
    return {
      ...record,
      ...parsedLine.value,
    };*/
  }
  return record;
}
/**
export function findProperty(json: any, propertyName: string): any {
  if (json && propertyName) {
    let props = propertyName.split('.');
    if (json[props[0]]) {
      if (props.length === 1) {
        return json[propertyName];
      } else {
        return UtilParser.findProperty(
          json[props[0]],
          props.slice(1).join('.')
        );
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}*/
