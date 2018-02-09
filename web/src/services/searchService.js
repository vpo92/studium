// @flow

import type { Dispatch } from 'redux';

import {
  showSnackbar,
  requestProsopographyDetails,
  receiveProsopographyDetails,
  requestProsopographiesByFirstLetter,
  receiveProsopographiesByFirstLetter,
} from '../actions/Search/searchActions';

import { type Prosopography } from '../../../api/types/Prosopography';

const baseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
export async function fetchSearchByKeyword(
  keyword: string
): Promise<Prosopography[]> {
  const result = await fetch(`${baseUrl}/prosopography/search/${keyword}`);
  return result.json();
}

export async function fetchProsopographyById(
  itemId: string
): Promise<Prosopography> {
  const result = await fetch(`${baseUrl}/prosopography/${itemId}`);
  return result.json();
}

export function fetchProsopographyByReference(
  reference: string
): Dispatch => Promise<void> {
  return async dispatch => {
    try {
      dispatch(requestProsopographyDetails(reference));
      const result = await fetch(`${baseUrl}/prosopography/${reference}`);
      const prosopography = await result.json();
      dispatch(receiveProsopographyDetails(prosopography));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  }
}

export function fetchProsopographiesByFirstLetter(letter: string): Dispatch => Promise<void> {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(requestProsopographiesByFirstLetter(letter));
      const result = await fetch(`${baseUrl}/prosopography/index/${letter}`);
      const prosopographies = await result.json();
      dispatch(receiveProsopographiesByFirstLetter(letter, prosopographies));
    } catch (e) {
      dispatch(showSnackbar(true, `Couldn't get response from server.`));
    }
  };
}
