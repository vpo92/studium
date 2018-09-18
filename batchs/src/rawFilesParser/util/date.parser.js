// @flow
import type {
  DateInformation,
} from '../types';


export function isolateDates(value: ?string): ?string[] {


  //split
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

export function parseDates(value: ?string): ?DateInformation {
  if (value) {
    const dGroup = '([0-9]+)';
    if (value.indexOf('-') >= 0) {
      const match = new RegExp(`:?${dGroup}:?-:?${dGroup}:?`).exec(value);
      return {
        type: 'INTERVAL',
        startDate: {
          value: new Date(match[1]),
          certain: !value.trim().startsWith(':'),
        },
        endDate: {
          value: new Date(match[2]),
          certain: !value.trim().endsWith(':'),
        },
      };
    } else {
      const startDateOnly = `${dGroup}:?`;
      const endDate = ` ?:${dGroup}`;
      const match = new RegExp(`${startDateOnly}|${endDate}`).exec(value);
      const type = value.indexOf(':') >= 0 ? 'INTERVAL' : 'SIMPLE';
      if (match[1]) {
        return {
          type,
          startDate: {
            value: new Date(match[1]),
            certain: true,
          },
        };
      } else {
        if (match[2]) {
          return {
            type,
            endDate: {
              value: new Date(match[2]),
              certain: true,
            },
          };
        }
      }
    }
  }
  return null;
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
