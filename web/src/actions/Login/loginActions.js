// @flow

import { processLogin } from '../../services/loginAPIService';

export const requestLogin = (username, password) => {

  return async (dispatch,getState) => {
    const { studium: { apiUrl } } = getState();

    //FIXME : auth get errors
    let user = await processLogin(apiUrl,username, password);

    if(user){
      dispatch({ type: 'LOGIN_SUCCESS', user: user });
    }else{
      dispatch({ type: 'LOGIN_FAILURE', error: "Authentication failed" });
    }
  }
};
