// @flow

export function detectInstitutions(value: string): string[] {


  //split
  if(value && value.indexOf("£") > 0){
    let t = value.split("£");
    let res = [];
    //remove first part
    t = t.slice(1);
    for(let i = 0; i < t.length; i++){
      if(!t[i].startsWith(" ")){
        //only get the first word
        res.push(t[i].split(" ")[0]);
      }
    }
    return res;
  }

  return null;
};
