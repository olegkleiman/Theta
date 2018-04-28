import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import { Switch, Route, Link } from 'react-router-dom';

import Instructions from './Instructions';
import Lists from './Lists';
import UserList from './UserList';
import ImportData from './ImportData';
import Reports from './Reports';
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
                    <Link className='nav-link' to='/dashboard/lists'>
                      Lists <span className="sr-only">(current)</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className='nav-link' to='/dashboard/import'>Import Data</Link>
                  </li>
                  <li className="nav-item">
                    <Link className='nav-link' to='/dashboard/reports'>Reports</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to='/dashboard/users'>Users</Link>
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

            <Switch>
              <Route exact path='/dashboard' component={Instructions} />
              <Route path={this.props.match.path + '/lists'} component={Lists} />
              <Route path={this.props.match.path + '/users'} component={UserList} />
              <Route path={this.props.match.path + '/import'} component={ImportData} />
              <Route path={this.props.match.path + '/reports'} component={Reports} />
            </Switch>

          </div>

          <Footer />
        </React.Fragment>);
  }

};

function mapStateToProps(state) {
  return {
    userName: state.userName,
    userPictureUrl: state.userPictureUrl
  }
}

export default connect(mapStateToProps)(Dashboard);
