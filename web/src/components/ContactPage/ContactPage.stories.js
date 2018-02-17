import React from 'react';
import { storiesOf } from '@storybook/react';
import ContactPage from './ContactPage.component';

storiesOf('ContactPage', module)
  .add('no props', () => (
    <ContactPage />
  ));
