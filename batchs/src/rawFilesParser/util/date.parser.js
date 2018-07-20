// @flow
import type {
  DateType,
  DateInformation,
  SimpleDateInformation,
} from '../types';


export function isolateDates(value: string): ?string[] {


  //split
  if(value && value.indexOf("%") >= 0){
    let t = value.split("%");
    let res = [];
    //remove first part
    t = t.slice(1);
    for(let i = 0; i < t.length; i++){
      if(!t[i].startsWith(" ")){
        //only get the first word
        let w = t[i].split(" ")[0]
        if(w.length > 0)
          res.push(w);
      }
    }
    return res;
  }

  return null;
};

export function parseDates(value: string): ?DateInformation{
  let result = null;
  let t = null;
  if(value){
    value = value.trim();
    let interval = value.split("-");
    if(interval.length > 1){
      //FIXME : deal with :
      result = {
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date(interval[0]),
          "certain": true,
        },
        "endDate": {
          "value": new Date(interval[1]),
          "certain": true,
        }
      };
      //before
    }else if(t = (/[:]([0-9]+)/).exec(value)){
      result = {
        "type": 'INTERVAL',
        "endDate": {
          "value": new Date(t[1]),
          "certain": true,
        }
      };
      // after
    }else if(t = (/([0-9]+)[:]/).exec(value)){
      result = {
        "type": 'INTERVAL',
        "startDate": {
          "value": new Date(t[1]),
          "certain": true,
        }
      };
    }else if(t = (/([0-9]+)/).exec(value)){
      result = {
        "type": 'SIMPLE',
        "startDate": {
          "value": new Date(value),
          "certain": true,
        }
      };
    }
  }


  return result;
}

export function detectDates(value: string): ?DateInformation[] {
  let result = null;
  let dates = isolateDates(value);

  if(dates){
    result = [];
    for(let i =0; i < dates.length;i++){
      let d = parseDates(dates[i]);
      if(d){
        result.push(d);
      }
    }
  }
  return result;
}
