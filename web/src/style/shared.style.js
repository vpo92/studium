// @flow

export type sharedStyleType = {
  page: {
    marginTop: string,
    padding: string,
  },
  biggerText: {
    fontSize: string,
    lineHeight: string,
  },
};

export const primaryColorCode = '#3f51b5';
export const secondaryColorCode = '#f50057';

const page = {
  marginTop: '64px',
  padding: '10px',
};

const biggerText = {
  fontSize: '1.4em',
  lineHeight: '1.5em',
};

export const sharedStyle = {
  page: page,
  biggerText: biggerText,
  container: {
    ...page,
    ...biggerText,
  },
};
