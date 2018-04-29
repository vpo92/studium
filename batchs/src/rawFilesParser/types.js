// @flow

export type Prosopography = {
  reference: string,
  name: string,
  nameVariant: string,
  job: string,
}

export type Line = 'BIBLIOGRAPHY_START' | 'DATA' | 'EMPTY' | 'ERROR';

export type ParsedLine = { type: Line, value?: $Shape<Prosopography> };

export type SaveRecordFunction = (record: Prosopography) => Promise<void>;
