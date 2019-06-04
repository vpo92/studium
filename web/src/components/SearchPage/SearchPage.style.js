// @flow

import { sharedStyle } from '../../style/shared.style';

const searchPageStyle = {
  container: {
    ...sharedStyle.page,
  },
  paper: {
    padding:20,
    margin:10,
  },
  textField: {
    width: 200,
  },
  selectField: {
    width: 200,
  },
  fullSearchField: {
    width: 400,
  },
}

export default searchPageStyle;
