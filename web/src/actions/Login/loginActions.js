// @flow

import { processLogin, processLogout } from '../../services/loginAPIService';

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

export const requestLogout = () => {
  return async (dispatch) => {
    processLogout();
    dispatch({ type: 'LOGOUT_SUCCESS'});
  }

}
