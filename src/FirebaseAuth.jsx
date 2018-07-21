// @flow
import React from 'react';
import firebase from './firebase.js';

type State = {
  secRoles: string[]
}

const fetchUser = new Promise( (resolve, reject) => {
  firebase.auth().onAuthStateChanged( (user) => {
      if( user ) {
        resolve(user)
      } else {
        reject(console.error)
      }
    })
  });

let withAuth = (WrappedComponent) => class extends React.Component<{}, State> {

  state = {
    secRoles: []
  }

  async componentDidMount() {

    const user = await fetchUser;
    const email = user.email;

    let response = await firebase.firestore().collection('users')
                                    .where("email", "==", email)
                                    .get();
    if( response.docs.length != 0 ) {
      const docSnapshot = response.docs[0];
      let userRoles = docSnapshot.data().sec_roles;

      if( !userRoles ) {
        userRoles = ['']; // assign empty roles
      }

      this.setState({
        secRoles: userRoles
      });

    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.secRoles && nextState.secRoles.length > 0 ? true : false;
  }

  render() {

    return (
              <React.Fragment>
                <WrappedComponent
                  secRoles={this.state.secRoles}
                  {...this.props} />
              </React.Fragment>
            )
  }
}

export default withAuth;
