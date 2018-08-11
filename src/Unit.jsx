// @flow
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import firebase from './firebase.js';
import { Button, Row, Col, Input,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';

import UnitUpdates from './UnitUpdates';
import UnitGroups from './UnitGroups';

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
  },
  docId: String,
}

type Props = {
  docId: String
}

@withRouter
@connect()
export default
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
    docId: '',
  }

  async componentDidMount() {

     await this._loadData(this.props.docId);

  }

  async componentDidUpdate(prevProps, prevState) {

    if( prevProps.docId !== this.props.docId ) {
      await this._loadData(this.props.docId)
    }

  }

  // static getDerivedStateFromProps(props, state) {
  //
  //   if( props.docId !== state.docId ) {
  //
  //     const getOptions = {
  //       source: 'server'
  //     }
  //
  //     return firebase.firestore().collection('units').doc(props.docId)
  //       .get(getOptions)
  //       .then( doc => {
  //
  //         let data = doc.data();
  //
  //         return{
  //             docData: data,
  //             docId: props.docId
  //         }
  //
  //       });
  //
  //   } else {
  //
  //     // Return null to indicate no changes to state
  //     return null;
  //   }
  //
  // }

  async _loadData(docId: String) {

    if( docId !== this.props.id ) {

      const getOptions = {
        source: 'cache'
      }

      const self = this;

      const doc = await firebase.firestore().collection('units').doc(docId)
                .get(getOptions);
      let data = doc.data();

      self.setState({
          docData: data,
          docId: docId
      });

    }

  }

  addGroup() {
      this.props.history.push('/dashboard/addgroup/' + this.state.docId);
  }

  render() {

    // No changes are permitted for uncontrolled inputs within this form.
    // Accordingly, we use'value' prop for these inputs set to the appropriate
    // values in state. Such design does not allow actual reflecting user typing.
    // It seems better that making all input disabled.
    // If you wabt to enable changes for some input, provide 'defaultValue' props
    // provide ref for such input and set its the 'value' after getting
    // docDate from firebase

    return <div>
              <div className='card'>
                <ul className='nav nav-tabs lustify-content-center' role='tablist'>
                  <li className='nav-item'>
                    <a className='nav-link nav-tab active' data-toggle='tab' href='#groups'
                      role='tab' area-expanded='false'>
                          <i className='now-ui-icons education_hat'
                              style={{
                                verticalAlign: 'middle'
                              }}></i>
                          <span>&nbsp;כיתות</span>
                    </a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link nav-tab' data-toggle='tab' href='#updates'
                      role='tab' area-expanded='false'>
                          <i className='now-ui-icons ui-1_calendar-60'
                             style={{
                                verticalAlign: 'middle'
                             }}></i>
                           <span>&nbsp;עדכונים</span>
                    </a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link nav-tab' data-toggle='tab' href='#general'
                        role='tab' area-expanded='true'>
                          <i className='now-ui-icons ui-2_settings-90'
                              style={{
                                verticalAlign: 'middle'
                              }}></i>
                            <span>&nbsp;הגדרות כלליות</span>
                    </a>
                  </li>
                </ul>
                <div className='card-body'>
                  <div className='tab-content text-center'>
                    <div id='general' className='tab-pane' role='tabpanel'>
                      <Row>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>שם</label>
                          <div>{this.state.docData.name_he}</div>
                        </Col>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>רשות</label>
                          <div>{this.state.docData.authority}</div>
                        </Col>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label active-label '>זכיין</label>
                          <div>{this.state.docData.concessionaire}</div>
                        </Col>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>סמל</label>
                          <div>{this.state.docData.symbol}</div>
                        </Col>
                      </Row>
                      <br />
                      <Row>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>סוג</label>
                          <div>{this.state.docData.type}</div>
                        </Col>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>סוג חינוך</label>
                          <div>{this.state.docData.education_type}</div>
                        </Col>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>אישור יוח"א</label>
                          <Input type='radio' checked readOnly value={this.state.docData.long_day_permit}
                                className='form-control'/>
                        </Col>
                        <Col md='3' className='text-left'>
                          <label className='form-control-label'>סטאטוס</label>
                          <div>{this.state.docData.status}</div>
                        </Col>
                      </Row>
                    </div>
                    <div id='updates' className='tab-pane' role='tabpanel'>
                      <UnitUpdates docId={this.state.docId} />
                    </div>
                    <div id='groups' className='tab-pane active' role='tabpanel'>

                        <div className="card card-body">
                          <div className='row'>
                              <div className='col col-12 d-flex justify-content-end'>
                              <Button color='primary'
                                      className='align-self-end'
                                      onClick={::this.addGroup}>
                                      <span>הוסף כיתה </span><i className="fa fa-plus-circle" aria-hidden="true"></i>
                                      </Button>
                              </div>
                          </div>
                          <UnitGroups docId={this.state.docId} />

                        </div>

                    </div>
                  </div>
                </div>
              </div>
           </div>
  }

}
