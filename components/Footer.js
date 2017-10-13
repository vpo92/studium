import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <Divider/>
        <div className="app-text-center">2017 - Studium</div>
      </footer>
    );
  }
}

export default Footer;
