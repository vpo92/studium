// @flow

import type { Dispatch } from 'redux';

import {
  requestProsopographiesByFirstLetter,
  receiveProsopographiesByFirstLetter,
  showSnackbar,
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

export async function fetchProsopographyByReference(
  reference: string
): Promise<Prosopography> {
  const result = await fetch(`${baseUrl}/prosopography/${reference}`);
  return result.json();
}

export function fetchProsopographiesByFirstLetter(letter: string): any {
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
