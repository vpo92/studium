// @flow

export function detectTitles(value: string): string[] {

  //split
  if(value && value.indexOf("&") >= 0){
    let t = value.split("&");
    let res = [];
    //remove first part
    t = t.slice(1);
    for(let i = 0; i < t.length; i=i+2){
      res.push(t[i]);
    }
    return res;

  }

  return null;
}
