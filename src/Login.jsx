// @flow
import React from 'react';
import { connect } from 'react-redux';
import GoogleButton from 'react-google-button'

import firebaseApp from './firebase.js';

class Login extends React.PureComponent {

  googleLogin() {

    var provider = new firebase.auth.GoogleAuthProvider();

    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('https://www.googleapis.com/auth/plus.me');
    firebaseApp.auth().signInWithPopup(provider)
    .then(result => {

      this.props.dispatch({
        type: 'LOGIN',
        data: {
          userName: result.additionalUserInfo.profile.name,
          userPictureUrl: result.additionalUserInfo.profile.picture,
          accessToken: result.credential.accessToken,
          jwt: result.credential.idToken
        }
      });

      this.props.history.push('dashboard');

    });

  }

  render() {

    return <div className='d-flex flex-lg-row justify-content-center'>
              <div className="p-4">
                <GoogleButton
                  onClick={::this.googleLogin}
                />
              </div>
          </div>

  }
};

export default connect()(Login);
