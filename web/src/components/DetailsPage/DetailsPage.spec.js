// @flow

import React from 'react';

import { mount } from 'enzyme';
import DetailsPage from './DetailsPage.component';
import { type Prosopography } from '../../../../api/types/Prosopography';

function getProsopography(identity: any): Prosopography {
  return {
    _id: '5a1712b8e3891d172ecd3fc4',
    reference: 1,
    identity: {
      name: { value: 'A. Fidelis' },
      nameVariant: [{ value: 'A. FIDELIS' }],
      description: { value: 'Notaire' },
      datesOfActivity: { from: '1414', to: '1414' },
      gender: { value: 'male' },
      status: { value: 'external' },
      ...identity,
    },
  };
}

describe('Details page', () => {
  it('should display the name when provided in prosopography', () => {
    // given
    const name = { value: 'A. Sudre' };
    const prosopography = getProsopography({ name });

    // when
    const wrapper = mount(
      <DetailsPage getDetails={() => {}} prosopography={prosopography} />
    );

    // then
    const nameNode = <span>{name.value}</span>;
    expect(wrapper.contains(nameNode)).toBeTruthy();

  });
  it('should display the dates of activity when provided in prosopography', () => {
    // given
    const datesOfActivity = { from: '1414', to: '1414' };
    const prosopography = getProsopography({ datesOfActivity });

    // when
    const wrapper = mount(
      <DetailsPage getDetails={() => {}} prosopography={prosopography} />
    );

    // then
    const datesOfActivityNode = <span>{`${datesOfActivity.from} - ${datesOfActivity.to}`}</span>;
    expect(wrapper.contains(datesOfActivityNode)).toBeTruthy();
  });
});
