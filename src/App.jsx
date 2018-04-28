// Flow
import React from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

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
      this.setState({
        userName: response.profileObj.name
      });
    }

  }

  logout = () => {
    this.setState({
      userName: ''
    });
  }

  render() {

    if( this.state.userName ) {
      return <React.Fragment>
                <GoogleLogout
                    buttonText="Logout"
                    onLogoutSuccess={::this.logout}>
                  </GoogleLogout>
                  <div className='loginText'>{this.state.userName}</div>
              </React.Fragment>
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

export default App;
