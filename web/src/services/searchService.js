// @flow

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

export async function fetchProsopographiesByFirstLetter(
  itemId: string
): Promise<Prosopography[]> {
  const result = await fetch(`${baseUrl}/prosopography/index/${itemId}`);
  return result.json();
}
