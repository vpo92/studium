//@flow
import type {Prosopography} from '../types';

/**
Add extra data to prosopography by loading special code to calculate indexes
*/
export function addExtraData(p: Prosopography, l: [(Prosopography)=>Prosopography]): Prosopography{
  if(p && Object.keys(p).length > 0){
    if(l){
      l.forEach((item) => {
        p = item(p);
      });
    }
  }
  return p;
}

export function addActivityMediane(p: Prosopography): Prosopography{
  if(p && Object.keys(p).length > 0){
    if(!p.extras){
      p.extras = {};
    }
    let item = p;
    if (item.identity.datesOfActivity[0].meta.dates.length > 0){
      let type = p.identity.datesOfActivity[0].meta.dates[0].type;
      if(type === "INTERVAL"){
        let startDate = p.identity.datesOfActivity[0].meta.dates[0].startDate.date;
        let endDate = p.identity.datesOfActivity[0].meta.dates[0].endDate.date;
        p.extras.activityMediane = Math.floor((startDate + endDate) / 2);
      }else {
        p.extras.activityMediane = p.identity.datesOfActivity[0].meta.dates[0].date;
      }
    }
  }
  return p;
}
