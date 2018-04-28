import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';

class Dashboard extends React.Component {

  // componentWillReceiveProps(nextProps){
  //
  // }

  logout = () => {

    this.props.dispatch({
      type: 'LOGOUT'
    });

    this.props.history.push('');

  }

  render() {
      return (
        <div>
          <GoogleLogout
            buttonText="Logout"
            onLogoutSuccess={::this.logout}>
          </GoogleLogout>
          <div className='loginText'>{this.props.userName}</div>
        </div>)

  }

};

function mapStateToProps(state) {
  return {
    userName: state.userName,
    userPictureUrl: state.userPictureUrl
  }
}

export default connect(mapStateToProps)(Dashboard);
