// @flow

import { sharedStyle } from '../../style/shared.style';

const contactPageStyle = {
  container: {
    ...sharedStyle.page,
  },
  header: {
    textAlign: 'center',
  },
  text: {
    ...sharedStyle.biggerText,
  },
  sponsorImage: {
    height: '70px',
    margin: '10px',
  },
};

export default contactPageStyle;
