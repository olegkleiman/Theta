// @flow
import React from 'react';
import { connect } from 'react-redux';

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

    return <div className='raw loginCtrl'>
              <div className='col text-center'>
              <button className='btn btn-gplus'
                onClick={::this.googleLogin}>
                <i className="fa fa-google-plus pr-1"></i> Google +
              </button>
            </div>
          </div>

  }
};

export default connect()(Login);
