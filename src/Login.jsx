// @flow
import React from 'react';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';

class Login extends React.Component {

  responseGoogle = (response) => {

    console.log(response);

    if( response.profileObj ) {

      this.props.dispatch({
        type: 'LOGIN',
        data: {
          userName: response.profileObj.name,
          userPictureUrl: response.profileObj.imageUrl
        }
      });

      this.props.history.push('dashboard');
    }
  }

  render() {

    return (<GoogleLogin
              clientId="110875185211-0d0fu4nji6ph5jkvqf14eafb8u6lvime.apps.googleusercontent.com"
              buttonText="Login"
              onSuccess={::this.responseGoogle}
              onFailure={::this.responseGoogle}>
                <i className='fab fa-google'></i>
                <span className='loginText'> Login with Google</span>
           </GoogleLogin>)

  }
};

export default connect()(Login);
