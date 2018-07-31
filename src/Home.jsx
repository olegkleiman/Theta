// @flow
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import { Container, Row, Col,
  Card, CardBody, CardText, CardTitle, CardFooter
} from 'reactstrap';

import firebase from './firebase.js';

type State = {
  activities: []
}

class Home extends React.Component<{},State> {

  state = {
    activities: []
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
                    <Col md='12'>
                      <Card>
                        <div className='card-header'>
                          <h5 className='title'>המשימות היומיות שלך</h5>
                        </div>
                        <CardBody>
                          <Row>
                            {
                              this.state.activities.map( (activity, index) => {
                                  return (
                                    <div className='col-3' key={index}>
                                      <Card body>
                                        <CardBody>
                                          <div>
                                            <a onClick={ () => ::this.activitySelected(activity.name) } href={activity.link}>
                                              <CardTitle>{activity.name}</CardTitle>
                                              <CardText>&nbsp;</CardText>
                                            </a>
                                          </div>
                                        </CardBody>
                                        <CardFooter className='card-footer'>
                                          <a className='card-footer-link'
                                             onClick={ () => ::this.activitySelected(activity.name) } href={activity.link}>
                                            {activity.description}
                                          </a>
                                        </CardFooter>
                                      </Card>
                                    </div>)
                              })
                            }
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

              </div>
            </div>)
  }

};

export default withRouter(connect()(Home));
