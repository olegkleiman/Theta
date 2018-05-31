// @flow
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import {
  Container,
  Row,
  Card
} from 'reactstrap';

import firebase from './firebase.js';

type State = {
  activities: []
}

type Props = {

}

class Home extends React.Component<State, Props> {

  constructor() {
    super();

    this.state = {
      activities: []
    }
  }

  componentDidMount() {

    const self = this;

    this.unregisterCollectionObserver =
      firebase.firestore().collection('activities').onSnapshot( (snap) => {

      const _activities = [];

      snap.forEach( (docSnapshot) => {

        let _activity = docSnapshot.data();

        const linkTarget = '#' + self.props.match.path + _activity.link;
        _activities.push({
          name: _activity.name,
          description: _activity.description,
          link: linkTarget
        });

      });

      this.setState({
        activities: _activities
      })

    });
  }

  componentWillUnmount() {
    if( this.unregisterCollectionObserver ) {
      this.unregisterCollectionObserver();
    }
  }

  activitySelected(activityName: String) {

    this.props.dispatch({
      type: 'PAGE_NAVIGATED',
      data: {
        pageName: activityName
      }
    });
  }

  render() {
    return (<div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                  <Row>
                    <div className='col col-md-12'>
                      <div className='card'>
                        <div className='card-header'>
                          <h5 className='title'>Your daily tasks</h5>
                          <p className='category'>Sorted by recent activity</p>
                        </div>
                        <div className='card-body'>
                          <Row>
                            {
                              this.state.activities.map( (activity, index) => {
                                  return (
                                    <div className='col-3' key={index}>
                                      <div className='card card-user'>
                                        <div className='card-body'>
                                          <div>
                                            <a onClick={ () => ::this.activitySelected(activity.name) } href={activity.link}>
                                              <h5><b>{activity.name}</b></h5>
                                              <p className='card-text'>{activity.description}</p>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>)
                              })
                            }
                          </Row>
                        </div>
                      </div>
                    </div>
                  </Row>

              </div>
            </div>)
  }

};

export default withRouter(connect()(Home));
