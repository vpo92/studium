// @flow

import { search } from '../actions/Search/searchActions';

const results = [
  {
    id: '11546',
    name: 'ABRAHAM Alberti',
    mediane: '1435',
    status: 'Maître',
    origine: 'France',
  },
  {
    id: '16792',
    name: 'ABSALON Absolonis',
    mediane: '1256',
    status: 'Étudiant',
    origine: 'Italie',
  },
  {
    id: '8925',
    name: 'ADAM Barate',
    mediane: '1256',
    status: 'Étudiant',
    origine: 'Suède',
  },
];

export const searchByKeyWord = async (keyWord: string) => {
  const result = await fetchSearchByKeyword(keyWord);
  return search({ keyWord, result });
};

// Call API here
async function fetchSearchByKeyword(keyword: string) {
  const result = await fetch('http://localhost:3000/prosopography');
  return result.json();
}
