// @flow
import React from 'react';
import { connect } from 'react-redux';
import firebase from './firebase.js';

import {
  Row,
  Col
} from 'reactstrap';

type State = {
  subActivities: []
}

type Props = {

}

class Office extends React.Component<Props, State>  {

  state = {
    subActivities: []
  }

  componentDidMount() {
    const getOptions = {
      source: 'server'
    }

    const self = this;

    firebase.firestore().collection('activities')
      .get(getOptions)
      .then( response => {

        response.docs.forEach( (activity) => {
          if( activity.data().name === 'Office' ) {

            const subActivities = [];

            activity.ref.collection('sub_activities')
            .get(getOptions)
            .then( resp => {

              resp.docs.forEach( (subActivity) => {
                const activityData = subActivity.data();
                subActivities.push({
                  name: activityData.name,
                  link: activityData.link,
                  description: activityData.description
                });
              });

              self.setState({
                subActivities: subActivities
              });

            })

          }
        });


      })
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
    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>עבודות משרדיות</h5>
                      </div>
                      <div className='card-body'>
                        <Row>
                          {
                            this.state.subActivities.map(( activity, index) => {
                              return (
                                <Col xs='3' key={index}>
                                  <div className='card card-user'>
                                    <div className='card-body'>
                                      <div>
                                        <a onClick={ () => ::this.activitySelected(activity.description) }
                                            href={activity.link}>
                                          <h5>{activity.name}</h5>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              )
                            })
                          }
                        </Row>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
           </div>
  }

}

export default connect()(Office);
