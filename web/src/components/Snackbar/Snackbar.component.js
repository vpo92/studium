// @flow

import React from 'react';
import Snackbar from 'material-ui/Snackbar';

import { type ShowSnackbar } from '../../actions/Search/searchActions';

type Props = {
  message: string,
  open: boolean,
  showSnackbar: ShowSnackbar,
}

export default function SnackbarComponent(props: Props) {
  return <Snackbar
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    open={props.open}
    autoHideDuration={6000}
    onClose={() => props.showSnackbar(false, '')}
    SnackbarContentProps={{
      'aria-describedby': 'message-id',
    }}
    message={<span id="message-id">{props.message}</span>}
  />;
}
