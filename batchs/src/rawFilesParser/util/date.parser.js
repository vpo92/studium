// @flow
import type {
  DateInformation,
} from '../types';


export function isolateDates(value: ?string): ?string[] {
  if (value && value.indexOf("%") >= 0) {
    let t = value.split("%");
    let res = [];
    //remove first part
    t = t.slice(1);
    for (let i = 0; i < t.length; i++) {
      if (!t[i].startsWith(" ")) {
        //only get the first word
        let w = t[i].split(" ")[0]
        if (w.length > 0)
          res.push(w);
      }
    }
    return res;
  }
  return null;
}
export function parseDates(value: string): ?DateInformation{
  let result = null;
  let t = null;
  if(value){
    value = value.trim();
    let interval = value.split("-");
    if(interval.length > 1){
      result = {
        "type": 'INTERVAL',
        "startDate":  parseDates(interval[0]),
        "endDate": parseDates(interval[1])
      };
      //before
    }else if(t = (/[:]([0-9]+)[:]/).exec(value)){
      result = {
        "type": 'NEAR',
        "date": parseInt(t[1]),
      };
    }else if(t = (/[:]([0-9]+)/).exec(value)){
      result = {
        "type": 'BEFORE',
        "date": parseInt(t[1]),
      };
      // after
    }else if(t = (/([0-9]+)[:]/).exec(value)){
      result = {
        "type": 'AFTER',
        "date": parseInt(t[1]),
      };
    }else if(t = (/([0-9]+)/).exec(value)){
      result = {
        "type": 'SIMPLE',
        "date": parseInt(value),
      };
    }
  }
  return result;
}

export function detectDates(value: ?string): ?DateInformation[] {
  let result = null;
  let dates = isolateDates(value);
  if (dates) {
    result = [];
    for (let i = 0; i < dates.length; i++) {
      let d = parseDates(dates[i]);
      if (d) {
        result.push(d);
      }
    }
  }
  return result;
}
