import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import { Switch, Route, Link } from 'react-router-dom';
import { List, Datagrid, TextField } from 'react-admin';

import UserList from './UserList';
import ImportData from './ImportData';
import Footer from './Footer';

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
        <React.Fragment>
          <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
            <a className="navbar-brand" href="#">Theta</a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                  <li className="nav-item">
                    <a className="nav-link" href="#">Lists <span className="sr-only">(current)</span></a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Import Data</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Reports</a>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to='dashboard/users'>Users</Link>
                  </li>
                </ul>
                <div className="form-inline my-2 my-lg-0">
                    <img src={this.props.userPictureUrl}
                      className="img-fluid rounded-circle avatar" alt="User avatar" />
                    <GoogleLogout
                      buttonText="Logout"
                      onLogoutSuccess={::this.logout}>
                    </GoogleLogout>

                </div>
              </div>
          </nav>
          <div className='container'>

            <div id="headerwrap">Welcome, {this.props.userName}.
            <br></br>
                <p>Please use top menu to accomplish your tasks.</p>
            </div>

          </div>

          <Footer />


        </React.Fragment>)
  }

};

function mapStateToProps(state) {
  return {
    userName: state.userName,
    userPictureUrl: state.userPictureUrl
  }
}

export default connect(mapStateToProps)(Dashboard);
