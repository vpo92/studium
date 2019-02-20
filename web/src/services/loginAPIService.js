// @flow

export async function processLogin(apiUrl, username, password){

  let user = null;
  try {
    let response = await fetch(`${apiUrl}/auth/login`,{
      'method':'POST',
      'headers':{
        'Content-Type':'application/json',
      },
      'body': JSON.stringify({
        "email": username,
        "password": password,
        }),
    });
    let result = await response.json();

    if(response.ok){
      user = {
        username : username,
        token: result.token,
      };
    }else{
      user = null;
    }
  }catch(e){
    //FIXME : TODOconsole.error("processLogin error :"+e);
  }
  return user;
}
