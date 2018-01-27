// @flow

import { type Profile } from '../actions/Search/searchTypes';
import { type Prosopography } from '../actions/Search/searchTypes';

const baseUrl = 'http://localhost:3000';

// Call API here
export async function fetchSearchByKeyword(keyword: string): Promise<Profile[]> {
  const result = await fetch(`${baseUrl}/prosopography/search/${keyword}`);
  return result.json();
}

export async function fetchProsopographyById(itemId: string): Promise<Prosopography> {
  const result = await fetch(`${baseUrl}/prosopography/${itemId}`);
  return result.json();
}

export async function fetchProsopographiesByFirstLetter(itemId: string): Promise<Prosopography[]> {
  const result = await fetch(`${baseUrl}/prosopography/index/${itemId}`);
  return result.json();
}
