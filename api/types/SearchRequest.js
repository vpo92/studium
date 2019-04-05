// @flow

export type MatchType = "EXACT" | "CONTAINS" | "STARTS";

export type SimpleRange = {
  from: string,
  to: string,
};

export type ProsopographyCriterion = {
  section: string,
  subSection: string,
  operator: string,
  matchType: MatchType,
  value: string,
};

export type SearchRequest = {
  name?: string,
  activityMediane?: SimpleRange,
  activity?: SimpleRange,
  status?: string,
  grade?: string,
  discipline?: string,
  prosopography?: [ProsopographyCriterion],
};
