// @flow


function parsePlace(value){
  return value.replace(/MS[.]+/g, '').trim();
}

function parseChunk2(value){
  let place = value.split(" ");
  let cote = place.pop();
  return {
    placeType : place.join(" ").trim(),
    cote : cote,
  }
}


function parsePlaceType(value){
  return parseChunk2(value).placeType;
}

function parseCote(value){
  return parseChunk2(value).cote;
}

function parsePage(value){
  //return value.replace(/\s/g, '');
  return value.trim();
}

//MS. Praha, Knih. Metrop. Kap. O.6, f. 119-141.
export function parseMS(value: string): any {
  if(value && value!==""){
    //split
    let t = value.split(",");
    if(t.length === 3){
      return {
        place : parsePlace(t[0]),
        placeType: parsePlaceType(t[1]),
        cote: parseCote(t[1]),
        page: parsePage(t[2]),
      };
    }else{
      return null;
    }
  }

  return null;
}
