// @flow

export type LoginSuccesAction = {
  type: 'LOGIN_SUCCESS',
  user: any,
};


export type LoginFailureAction = {
  type: 'LOGIN_FAILURE',
  error: any,
};
