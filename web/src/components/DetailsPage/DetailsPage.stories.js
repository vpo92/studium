// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import DetailsPage from './DetailsPage.component';

import { type Prosopography } from '../../../../api/types/Prosopography';

const prosopography: Prosopography = {
  _id: '5a1712b8e3891d172ecd3fc4',
  reference: 1,
  identity: {
    name: { value: 'A. Fidelis' },
    nameVariant: [{ value: 'A. FIDELIS' }],
    description: { value: 'Notaire' },
    datesOfActivity: { from: '1414', to: '1414' },
    gender: { value: 'male' },
    status: { value: 'external' },
  },
};

storiesOf('DetailsPage', module)
  .add('no props', () => <DetailsPage getDetails={() => {}} />)
  .add('with Prosopography', () => (
    <DetailsPage prosopography={prosopography} getDetails={() => {}} />
  ));
