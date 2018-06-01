// @flow
import React from 'react';
import { connect } from 'react-redux';

import {
  Row
} from 'reactstrap';

class Office extends React.Component {

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
                        <h5 className='title'>Administration procedures</h5>
                      </div>
                      <div className='card-body'>
                        <Row>
                          <div className='col-3'>
                            <div className='card card-user'>
                              <div className='card-body'>
                                <div>
                                  <a onClick={ () => ::this.activitySelected('Units Management') } href='#/dashboard/units'>
                                    <h5>Units (schools) management</h5>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
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
