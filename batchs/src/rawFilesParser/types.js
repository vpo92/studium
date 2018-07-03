// @flow

export type MetaData = {
  certain: ?boolean,
  comment: ?string,
  link: ?string,
}

export type DateType = 'SIMPLE' | 'INTERVAL';

export type DateInformation = {
  type: DateType,
  startDate: ?SimpleDateInformation,
  endDate: ?SimpleDateInformation,
}

export type SimpleDateInformation = {
  value: Date,
  certain: boolean,
  comment: string,
  link: string,
}

export type SimpleInformation = {
  value: string,
  certain: boolean,
  comment: string,
  link: string,
}

export type Prosopography = {
  reference: string,
  name: string,
  nameVariant: string,
  shortDescription: string,
  datesOfLife: string,
  datesOfActivity: string,
  activityMediane: string,
  gender: SimpleInformation,
  status: SimpleInformation,
}

export type Line = 'BIBLIOGRAPHY_START' | 'DATA' | 'EMPTY' | 'ERROR';

export type ParsedLine = { type: Line, value?: $Shape<Prosopography> };

export type SaveRecordFunction = (record: Prosopography) => Promise<void>;
