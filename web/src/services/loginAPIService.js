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
      let response2 = await fetch(`${apiUrl}/user/me`,{
        'headers':{
          'Authorization':`Bearer ${result.token}`,
        },
      });
      if(response2){
        user = await response2.json();
        user.token = result.token;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  }catch(e){
    //FIXME : TODOconsole.error("processLogin error :"+e);
  }
  return user;
}

export function processLogout(){
  //TODO
  console.log("processLogout");
  localStorage.removeItem('user');
}
