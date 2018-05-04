import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Link } from 'react-router-dom';

import firebaseApp from './firebase.js';

import Instructions from './Instructions';
import Lists from './Lists';
import UserList from './UserList';
import ImportData from './ImportData';
import Reports from './Reports';
import Footer from './Footer';

import dashboardRoutes from './routes/dashboard.jsx';

import Sidebar from './Sidebar';

class Dashboard extends React.Component {

  // componentWillReceiveProps(nextProps){
  //
  // }

  logout = () => {

    firebaseApp.auth().signOut();

    this.props.dispatch({
      type: 'LOGOUT'
    });

    this.props.history.push('');

  }

  render() {
      return (
        <React.Fragment>
          <Sidebar {...this.props} routes={dashboardRoutes}/>
          <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
              <Link className='navbar-brand' to='/dashboard'>Theta</Link>
              <button className="navbar-toggler" type="button"
                  data-toggle="collapse"
                  data-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                  <li className="nav-item dropdown">
                    <Link className='nav-link dropdown-toggle' data-toggle='dropdown' to='/dashboard/lists'>
                      Lists <span className="sr-only caret">(current)</span>
                    </Link>
                    <ul className='dropdown-menu' role='menu'>
                      <li>
                        <a href='#'>One</a>
                      </li>
                      <li>
                        <a href='#'>Two</a>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link className='nav-link' to='/dashboard/import'>ייבוא נתונים</Link>
                  </li>
                  <li className="nav-item">
                    <Link className='nav-link' to='/dashboard/reports'>דו״חות</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to='/dashboard/users'>משתמשים</Link>
                  </li>
                </ul>
                <div className="form-inline my-2 my-lg-0">
                    <img src={this.props.userPictureUrl}
                      className="img-fluid rounded-circle avatar" alt="User avatar" />
                    <button className='btn'
                       onClick={::this.logout}>
                      <i className="fa fa-google-plus pr-1"></i> Logout
                    </button>

                </div>
              </div>
          </nav>
          <div className='container'>

            <Switch>
              <Route exact path='/dashboard' render={ (props) => <Instructions userName={this.props.userName} /> } />
              <Route path={this.props.match.path + '/lists'} component={Lists} />
              <Route path={this.props.match.path + '/users'} component={UserList} />
              <Route path={this.props.match.path + '/import'} component={ImportData} />
              <Route path={this.props.match.path + '/reports'} component={Reports} />
            </Switch>

          </div>

          <Footer fluid/>
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
