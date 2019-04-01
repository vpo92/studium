
export async function importProsopographyFromText(apiUrl, token, prosopography){
  //console.log("editProsopographyService.importProsopographyFromText");
  let p = null;
  try {
    let response = await fetch(`${apiUrl}/prosopography/from-text`,{
      'method':'POST',
      'headers':{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+token,
      },
      'body': JSON.stringify({
        "prosopography": prosopography,
        }),
    });
    p = await response.json();
  }catch(e){
    //FIXME : TODOconsole.error("processLogin error :"+e);
    //console.error(e)
  }
  return p;

}
