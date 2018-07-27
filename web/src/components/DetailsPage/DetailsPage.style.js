// @flow

import { sharedStyle } from '../../style/shared.style';
import { primaryColorCode, secondaryColorCode } from '../../style/shared.style';

const detailPageStyle = {
  container: {
    ...sharedStyle.page,
  },
  title: {
    color: 'black',
    textAlign: 'center',
  },
  primaryColor: {
    color: primaryColorCode,
  },
  detailsTopic: {
    fontSize: '1.2em',
    lineHeight: '1.6em',
  },
  detailsTopicLabel: {
    fontWeight: 'bold',
    color: primaryColorCode,
  },
  commentLabel:{
    color: secondaryColorCode,
    fontStyle: 'italic',
    listStyleType: 'none',
  },
};

export default detailPageStyle;
