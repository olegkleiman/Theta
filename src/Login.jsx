// @flow
import React from 'react';
import { connect } from 'react-redux';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import firebase from 'firebase/app';
import firebaseApp from './firebase.js';

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccess: () => false
  }
};

@connect()
export default
class Login extends React.PureComponent {

  // Listen to the Firebase Auth state and set the local state.
   componentDidMount() {
     firebaseApp.auth().onAuthStateChanged(
         (user) => {

           if( user ) {

             // Can I dispatch several actions at once?
             this.props.dispatch({
               type: 'LOGIN',
               data: {
                 userName: user.displayName,
                 userPictureUrl: user.photoURL
               }
             });

             this.props.dispatch({
               type: 'PAGE_NAVIGATED',
               data: {
                 pageName: 'Home',
               }
             });

             this.props.history.push('dashboard');

          }
       }
     );
   }

  render() {

    return <div className='d-flex flex-lg-row justify-content-center'>
              <div className="p-4">
              <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseApp.auth()}/>
              </div>
          </div>

  }
};
