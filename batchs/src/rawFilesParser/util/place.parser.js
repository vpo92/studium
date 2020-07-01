// @flow

export function detectPlaces(value: string): string[] {

//FIXME : remove trailing . , )

  //split
  if(value && value.indexOf("*") >= 0){
    let t = value.split("*");
    let res = [];
    //remove first part
    t = t.slice(1);
    for(let i = 0; i < t.length; i++){
      if(!t[i].startsWith(" ")){
        //only get the first word
        let value = t[i].split(" ")[0];
        value = value.split(')').join('');
        value = value.split('(').join('');
        value = value.split('.').join('');
        value = value.split(',').join('');
        value = value.split('?').join('');
        value = value.split('=').join(' ');
        res.push(value);
      }
    }
    return res;
  }

  return null;
}
