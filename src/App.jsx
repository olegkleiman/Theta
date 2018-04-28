// Flow
import React from 'react';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';

import Dashboard from './Dashboard';

type Props = {

}

type State = {
  userName: string
}

class App extends React.Component<Props,State> {

  state = {
    userName: '',
  };

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

      this.setState({
        userName: response.profileObj.name
      });
    }
  }



  render() {

    if( this.state.userName ) {

      return <Dashboard />

    } else {

      return (<GoogleLogin
                clientId="110875185211-0d0fu4nji6ph5jkvqf14eafb8u6lvime.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={::this.responseGoogle}
                onFailure={::this.responseGoogle}>
                  <i className='fab fa-google'></i>
                  <span className='loginText'> Login with Google</span>
             </GoogleLogin>)
    }

  }

}

export default connect()(App);
