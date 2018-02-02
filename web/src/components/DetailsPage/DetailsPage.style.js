// @flow

import { sharedStyle } from '../../style/shared.style';
import { primaryColorCode } from '../../style/shared.style';

const detailPageStyle = {
  container: {
    ...sharedStyle.page,
  },
  title:{
    color:'black',
    textAlign:'center',
  },
  primaryColor:{
    color:primaryColorCode,
  },
};

export default detailPageStyle;