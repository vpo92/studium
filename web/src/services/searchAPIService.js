// @flow

import type { Dispatch } from 'redux';
import type { SearchRequest } from '../../../api/types/SearchRequest';
import {
  showSnackbar,
  requestApiUrl,
  receiveApiUrl,
  requestProsopographiesByKeyword,
  receiveProsopographiesByKeyword,
  requestProsopographyDetails,
  receiveProsopographyDetails,
  requestProsopographiesByFirstLetter,
  receiveProsopographiesByFirstLetter,
  requestProsopographiesBySearch,
  receiveProsopographiesBySearch,
} from '../actions/Search/searchActions';

import type { State } from '../index';

export function fetchApiUrl(): Dispatch => Promise<void> {
  return async dispatch => {
    try {
      dispatch(requestApiUrl());
      if (process.env.NODE_ENV !== 'production') {
        dispatch(receiveApiUrl('http://localhost:3000'));
        return;
      }
      const result = await fetch(`${window.location.origin}/api/url`);
      const apiUrl = await result.text();
      dispatch(receiveApiUrl(apiUrl));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  };
}

export function fetchProsopographiesByKeyword(
  keyword: string
): (Dispatch, () => State) => Promise<void> {
  return async (dispatch, getState) => {
    const { studium: { apiUrl } } = getState();
    try {
      dispatch(requestProsopographiesByKeyword(keyword));
      const result = await fetch(`${apiUrl}/prosopography/search/${keyword}`);
      const prosopographies = await result.json();
      dispatch(receiveProsopographiesByKeyword(keyword, prosopographies));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  };
}

export function fetchProsopographyByReference(
  reference: string
): (Dispatch, () => State) => Promise<void> {
  return async (dispatch, getState) => {
    const { studium: { apiUrl } } = getState();
    try {
      dispatch(requestProsopographyDetails(reference));
      const result = await fetch(`${apiUrl}/prosopography/${reference}`);
      const prosopography = await result.json();
      dispatch(receiveProsopographyDetails(prosopography));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  };
}

export function fetchProsopographiesByFirstLetter(
  letter: string
): (Dispatch, () => State) => Promise<void> {
  return async (dispatch, getState) => {
    const { studium: { apiUrl } } = getState();
    try {
      dispatch(requestProsopographiesByFirstLetter(letter));
      const result = await fetch(`${apiUrl}/prosopography/index/${letter}`);
      const prosopographies = await result.json();
      dispatch(receiveProsopographiesByFirstLetter(letter, prosopographies));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  };
}


export function fetchProsopographiesBySearch(
  searchRequest: SearchRequest
): (Dispatch, () => State) => Promise<void> {
  return async (dispatch, getState) => {
    const { studium: { apiUrl } } = getState();
    console.log('fetchProsopographiesBySearch');
    try {
      dispatch(requestProsopographiesBySearch(searchRequest));
      const result = await fetch(`${apiUrl}/prosopography/search/advanced`,{
        'method':'POST',
        'headers':{
          'Content-Type':'application/json',
        },
        'body': JSON.stringify(searchRequest),
      });
      const prosopographies = await result.json();
      console.log(prosopographies);
      dispatch(receiveProsopographiesBySearch(searchRequest, prosopographies));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  };
}
