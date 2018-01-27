// @flow

import { type Profile } from '../actions/Search/searchTypes';
import { type Prosopography } from '../actions/Search/searchTypes';

// Call API here
export async function fetchSearchByKeyword(keyword: string): Promise<Profile[]> {
  const result = await fetch(`http://localhost:3000/prosopography/search/${keyword}`);
  return result.json();
}

export async function fetchProsopographyById(itemId: string): Promise<Prosopography> {
  const result = await fetch(`http://localhost:3000/prosopography/${itemId}`);
  return result.json();
}
