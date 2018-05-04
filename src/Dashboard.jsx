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
import Header from './Header';

class Dashboard extends React.Component {

  render() {
      return (
        <div className="wrapper">
          <Sidebar {...this.props} routes={dashboardRoutes}/>
          <div className="main-panel" ref="mainPanel">
            <Header {...this.props}/>
            <Switch>
                <Route exact path='/dashboard' render={ (props) => <Instructions userName={this.props.userName} /> } />
                <Route path={this.props.match.path + '/lists'} component={Lists} />
                <Route path={this.props.match.path + '/users'} component={UserList} />
                <Route path={this.props.match.path + '/import'} component={ImportData} />
                <Route path={this.props.match.path + '/reports'} component={Reports} />
            </Switch>
            <Footer fluid/>
          </div>
        </div>);
  }

};

function mapStateToProps(state) {
  return {
    userName: state.userName,
    userPictureUrl: state.userPictureUrl
  }
}

export default connect(mapStateToProps)(Dashboard);
