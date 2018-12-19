// @flow

import { sharedStyle } from '../../style/shared.style';

const contactPageStyle = {
  container: {
    ...sharedStyle.page,
    ...sharedStyle.biggerText,
  },
  loginPaper: {
    margin: 'auto',
    maxWidth: 'fit-content',
    padding: '10px 100px',
    textAlign: 'center',
  },
  loginButton:{
    marginTop: '2em',
  },
}

export default contactPageStyle;
