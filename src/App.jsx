// Flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Login from './Login';
import Logout from './Logout';
import Dashboard from './Dashboard';

const App = () => {

    return(
      <Switch>
        <Route exact path='/' component={Login} />
        <Route path='/logout' component={Logout} />
        <Route path='/dashboard' component={Dashboard} />
      </Switch>)

};

export default App;
