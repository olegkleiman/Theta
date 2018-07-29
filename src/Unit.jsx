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

  gotoGroups() {
    this.props.dispatch({
      type: 'PAGE_NAVIGATED',
      data: {
        pageName: 'Groups of ' + this.state.docData.name
      }
    });

    this.props.history.push('/dashboard/groups/' + this.props.docId);

  }

  componentDidMount() {

     this._loadAsyncData(this.props.docId);

  }

  componentDidUpdate(prevProps, prevState) {

    if( prevProps.docId !== this.props.docId ) {
      this._loadAsyncData(this.props.docId)
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

  _loadAsyncData(docId: String) {

    if( docId !== this.props.id ) {

      const getOptions = {
        source: 'server'
      }

      const self = this;

      firebase.firestore().collection('units').doc(docId)
        .get(getOptions)
        .then( doc => {

          let data = doc.data();

          self.setState({
              docData: data,
              docId: docId
          })

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
                    <a className='nav-link active' data-toggle='tab' href='#groups'
                      role='tab' area-expanded='false'>
                      <Row>
                        <Col>
                          <i className='now-ui-icons education_hat'></i>&nbsp;כיתות
                        </Col>
                      </Row>
                    </a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' data-toggle='tab' href='#updates'
                      role='tab' area-expanded='false'>
                          <i className='now-ui-icons ui-1_calendar-60'></i>&nbsp;עדכונים
                    </a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' data-toggle='tab' href='#general'
                        role='tab' area-expanded='true'>
                          <i className='now-ui-icons ui-2_settings-90'></i>&nbsp;הגדרות כלליות
                    </a>
                  </li>
                </ul>
                <div className='card-body'>
                  <div className='tab-content text-center'>
                    <div id='general' className='tab-pane' role='tabpanel'>
                      <Row>
                        <Col className='text-left'>
                          <label className='form-control-label'>שם</label>
                          <Input type='text' value={this.state.docData.name_he} />
                        </Col>
                        <Col className='text-left'>
                          <label className='form-control-label'>רשות</label>
                          <Input type='text' value={this.state.docData.authority} />
                        </Col>
                        <Col className='text-left'>
                          <label className='form-control-label'>זכיין</label>
                          <Input type='text' value={this.state.docData.concessionaire} />
                        </Col>
                        <Col className='text-left'>
                          <label className='form-control-label'>סמל</label>
                          <Input type='text' value={this.state.docData.symbol} />
                        </Col>
                      </Row>
                      <Row>
                        <Col xs='2' className='text-left'>
                          <label className='form-control-label'>סוג</label>
                          <Input type='text' value={this.state.docData.type} />
                        </Col>
                        <Col xs='3' className='text-left'>
                          <label className='form-control-label'>סוג חינוך</label>
                          <Input type='text' value={this.state.docData.education_type} />
                        </Col>
                        <Col xs='3' className='text-left'>
                          <label className='form-control-label'>אישור יוח"א</label>
                          <Input type='radio' checked readOnly value={this.state.docData.long_day_permit}
                                className='form-control'/>
                        </Col>
                        <Col xs='4' className='text-left'>
                          <label className='form-control-label'>סטאטוס</label>
                          <Input type='text' value={this.state.docData.status} />
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
                                      onClick={::this.addGroup}>הוסף כיתה +</Button>
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

export default withRouter(connect()(Unit));
