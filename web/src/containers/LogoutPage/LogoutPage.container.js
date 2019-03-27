import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { requestLogout } from '../../actions/Login/loginActions';
import injectSheet from 'react-jss';
import { sharedStyle as style } from '../../style/shared.style';

class LogoutPage extends Component{

      constructor(props) {
          super(props);
          // reset login status
          this.handleLogout();
      }

      handleLogout = () => {
        this.props.handleLogout();
      };


      render() {
        return (
        <div className={this.props.classes.container}>LOGOUT_SUCCESS</div>
        )
      }

}

const mapStateToProps = state => {
  return {
    loggedIn: state.studium.login.loggedIn,
  };
};

const mapDispatchToProps = dispatch => ({
  handleLogout: () => {
    dispatch(requestLogout());
  },
});

export default withRouter(
  connect(mapStateToProps,mapDispatchToProps)(injectSheet(style)(LogoutPage))
);

/**
const connectedPage = connect(mapStateToProps)(LogoutPage);
export { connectedPage as LogoutPage };
*/
