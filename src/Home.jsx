// @flow
import React from 'react';
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
    this.unregisterCollectionObserver =
      firebase.firestore().collection('activities').onSnapshot( (snap) => {

      const _activities = [];

      snap.forEach( (docSnapshot) => {

        let _activity = docSnapshot.data();

        _activities.push({
          name: _activity.name,
          description: _activity.description,
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

  render() {
    return (<Container className='containerShift'>
                <Row>
                  {
                    this.state.activities.map( (activity, index) => {
                        return (
                          <div className='col-3' key={index}>
                            <div className='card card-user'>
                              <div className='card-body'>
                                <h5 className='card-title'>{activity.name}</h5>
                                <p className='card-text'>{activity.description}</p>
                              </div>
                            </div>
                          </div>)
                    })
                  }
                </Row>
            </Container>)
  }

};

export default Home;
