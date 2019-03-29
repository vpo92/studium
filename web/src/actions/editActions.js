import { importProsopographyFromText } from '../services/editProsopographyService';

export const createProsopography = (inputTxt) => {

  return async (dispatch,getState) => {
    const {
      studium: { apiUrl, login }
    } = getState();


    let result = await importProsopographyFromText(apiUrl, login.user.token, inputTxt);

    if(result){
      dispatch({ type: 'CREATE_SUCCESS' });
    }else{
      dispatch({ type: 'CREATE_FAILURE', error: "Authentication failed" });
    }
  }
};
