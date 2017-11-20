// @flow

import { search } from '../actions/Search/searchActions';

export const searchByKeyWord = async (keyWord: string) => {
  const result = await fetchSearchByKeyword(keyWord);
  return search({ keyWord, result });
};

// Call API here
async function fetchSearchByKeyword(keyword: string) {
  const result = await fetch(`http://localhost:3000/prosopography/search/${keyword}`);
  return result.json();
}
