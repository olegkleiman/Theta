// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Link } from 'react-router-dom';

import Home from './Home';
import Lists from './Lists';
import UserList from './UserList';
import ImportWizard from './ImportWizard/ImportWizard';
import ReportsWizard from './ReportsWizard';
import InspectionForm from './forms/InspectionForm';
import Footer from './Footer';
import Office from './Office';
import Units from './Units';
import Models from './Models';
import Groups from './Groups';
import Group from './Group';
import AddGroup from './AddGroup';

import firebase from './firebase.js';
import dashboardRoutes from './routes/dashboard.jsx';

import Sidebar from './Sidebar';
import Header from './Header';

type State = {
  routes: [],
  error: String
}

type Props = {
  match: {
    path: String
  }
}

class Dashboard extends React.Component<Props, State> {

  constructor() {
    super();

    this.state = {
      routes: [],
      error: ''
    }
  }

  componentDidMount() {

    const self = this;

    firebase.auth().onAuthStateChanged( (user) => {
      if( user ) {
        const email = user.email;

        // get user's role
        firebase.firestore().collection('users')
                .where("email", "==", email)
                .get()
                .then( response => {

                    if( response.docs.length == 0 ) {
                      self.setState({
                        error: 'לצערנו אין לך הרשאות גישה למערכת'
                      });
                    }

                    const docSnapshot = response.docs[0];
                    return docSnapshot.data().role;
                })
                .then( role => {
                    // get allowed routes for the found role
                    firebase.firestore().collection('dashboard_routes')
                    .where("forRoles." + role, "==", true)
                    .get()
                    .then( response => {

                      const _routes = response.docs.map( docSnapshot => (
                          docSnapshot.data().name
                      ));

                      // filter existing routes with allowed ones
                      const allowedRoutes = dashboardRoutes.filter( route =>
                          _routes.includes(route.name) || route.redirect
                      );

                      self.setState({
                        routes: allowedRoutes
                      });

                    })

                });

      }
    });

  }

  render() {
      if( this.state.error ) {
        return (<div>{this.state.error}</div>)
      }

      return (
        <div className="wrapper">
          <Sidebar {...this.props} routes={this.state.routes}/>
          <div className="main-panel" ref="mainPanel">
            <Header {...this.props}/>
            <Switch>
                <Route exact path='/dashboard' render={ (props) => <Home /> } />
                <Route path={this.props.match.path + '/lists'} component={Lists} />
                <Route path={this.props.match.path + '/users'} component={UserList} />
                <Route path={this.props.match.path + '/import'} component={ImportWizard} />
                <Route path={this.props.match.path + '/reports'} component={ReportsWizard} />

                <Route path={this.props.match.path + '/inspection'} component={InspectionForm} />
                <Route path={this.props.match.path + '/office'} component={Office} />
                <Route path={this.props.match.path + '/units'} component={Units} />
                <Route path={this.props.match.path + '/models'} component={Models} />
                <Route path={this.props.match.path + '/addgroup/:unitid'} component={AddGroup} />
                <Route path={this.props.match.path + '/group/:groupid'} component={Group} />
                <Route path={this.props.match.path + '/groups/:unitid'} component={Groups} />
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
