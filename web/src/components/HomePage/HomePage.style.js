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
  'app-home-sponsor-img': {
    height: '70px',
    margin: '10px',
  },
};

export default contactPageStyle;
