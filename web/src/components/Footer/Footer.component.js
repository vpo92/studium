// @flow

import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import injectSheet from 'react-jss';

import { styles, type stylesType } from './Footer.style';

class Footer extends Component<{classes: stylesType}> {
  render() {
    return (
      <footer className={this.props.classes.footer}>
        <Divider/>
        <div className="app-text-center">2017 - Studium</div>
      </footer>
    );
  }
}

export default injectSheet(styles)(Footer);
