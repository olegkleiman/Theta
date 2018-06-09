// @flow
import React from 'react';
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
  docData: Object,
  docId: String
}

type Props = {
  docId: String
}

class Model extends React.Component<Props, State> {

  state = {
    docData: {},
    docId: ''
  }

  componentDidMount() {
     this._loadAsyncData(this.props.docId);
  }

  componentDidUpdate(prevProps: Object, prevState: Object) {

    if( prevProps.docId !== this.props.docId ) {
      this._loadAsyncData(this.props.docId)
    }

  }

  _loadAsyncData(docId: String) {
    if( docId !== this.props.id ) {

      const getOptions = {
        source: 'server'
      }

      const self = this;

      firebase.firestore().collection('models').doc(docId)
      .get(getOptions)
      .then( doc => {

        let data = doc.data();

        self.setState({
            docData: data,
            docId: docId
        })
      })

    }
  }

  render() {
    return (
      <div>
        <div className='card'>
          <Row>
            <Col>
              <label className='form-control-label'>Number</label>
              <Input type='text' value={this.state.docData.number} disabled />
            </Col>
            <Col>
              <label className='form-control-label'>Education type</label>
              <Input type='text' value={this.state.docData.education_type} />
            </Col>
            <Col>
              <label className='form-control-label'>Institution Type</label>
              <Input type='text' value={this.state.docData.institution_type} />
            </Col>
          </Row>
          <Row>
            <Col>
              <label className='form-control-label'>Status</label>
              <Input type='text' value={this.state.docData.status} />
            </Col>
          </Row>
        </div>
      </div>
    )
  }

};

export default Model;
