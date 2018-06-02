// @flow
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import firebase from './firebase.js';
import {
  Button,
  Row,
  Col,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

type State = {
  docData: {
    name: String,
    authority: String,
    concessionaire: String,
    symbol: String,
    type: String,
    education_type: String,
    long_day_permit: Boolean,
    status: String
  }
}

type Props = {
  id: String
}

class Unit extends React.Component<Props, State> {

  state = {
    docData: {
      name: '',
      authority: '',
      concessionaire: '',
      symbol: '',
      type: '',
      education_type: '',
      long_day_permit: false,
      status: ''
    },
  }

  gotoGroups() {
    this.props.dispatch({
      type: 'PAGE_NAVIGATED',
      data: {
        pageName: 'Groups of ' + this.state.docData.name
      }
    });

    this.props.history.push('/dashboard/groups');

  }

  componentDidMount() {

    const docId = this.props.id;

    const getOptions = {
      source: 'server'
    }

    const self = this;

    firebase.firestore().collection('units').doc(docId)
      .get(getOptions)
      .then( doc => {
        let data = doc.data();

        self.setState({
          docData: data
        });

      })
      .catch( error => {
        console.log(error);
      });
  }

  render() {
    return <div>
              <div className='card'>
                <ul className='nav nav-tabs lustify-content-center' role='tablist'>
                  <li className='nav-item'>
                    <a className='nav-link active' data-toggle='tab' href='#general'
                        role='tab' area-expanded='true'>
                      <i className='now-ui-icons ui-2_settings-90'></i>General Settings
                    </a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' data-toggle='tab' href='#updates'
                      role='tab' area-expanded='false'>
                      <i className='now-ui-icons ui-1_calendar-60'></i>Updates
                    </a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' data-toggle='tab' href='#groups'
                      role='tab' area-expanded='false'>
                      <i className='now-ui-icons education_hat'></i>Groups
                    </a>
                  </li>
                </ul>
                <div className='card-body'>
                  <div className='tab-content text-center'>
                    <div id='general' className='tab-pane' role='tabpanel'>
                      <Row>
                        <Col>
                          <label className='form-control-label'>Name</label>
                          <input type='text' value={this.state.docData.name}
                                className='form-control' />
                        </Col>
                        <Col>
                          <label className='form-control-label'>Authority</label>
                          <input type='text' value={this.state.docData.authority}
                                className='form-control' />
                        </Col>
                        <Col>
                          <label className='form-control-label'>Concessionaire</label>
                          <input type='text' value={this.state.docData.concessionaire}
                                className='form-control' />
                        </Col>
                        <Col>
                          <label className='form-control-label'>Symbol</label>
                          <input type='text' value={this.state.docData.symbol}
                                className='form-control' />
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <label className='form-control-label'>Type</label>
                          <input type='text' value={this.state.docData.type}
                                className='form-control' />
                        </Col>
                        <Col>
                          <label className='form-control-label'>Education Type</label>
                          <input type='text' value={this.state.docData.education_type}
                                className='form-control' />
                        </Col>
                        <Col>
                          <label className='form-control-label'>Long Day Permit</label>
                          <Input type='radio' checked readOnly value={this.state.docData.long_day_permit}
                                className='form-control' />
                        </Col>
                        <Col>
                          <label className='form-control-label'>Status</label>
                          <Input type='text' value={this.state.docData.status}
                                className='form-control' />
                        </Col>
                      </Row>
                    </div>
                    <div id='updates' className='tab-pane' role='tabpanel'>
                      Updates
                    </div>
                    <div id='groups' className='tab-pane' role='tabpanel'>
                      <Button color='primary'
                              onClick={::this.gotoGroups}>Next</Button>
                    </div>
                  </div>
                </div>
              </div>
           </div>
  }

}

export default  withRouter(connect()(Unit));
