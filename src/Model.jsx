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
  docData: {
    number: String,
    education_type: String,
    institution_type: String,
    status: String
  }
}

type Props = {
  docId: String
}

class Model extends React.Component<Props, State> {

  state = {
    docData: {
      number: '',
      education_type: '',
      institution_type: '',
      status: ''
    }
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
            docData: data
        })
      })

    }
  }

  render() {
    return (
      <div>
        <div className='card'>
          <div className='card-body'>
              <Row>
                <Col>
                  <label className='form-control-label'>מספר</label>
                  <Input type='text' value={this.state.docData.number} disabled />
                </Col>
                <Col>
                  <label className='form-control-label'>סוג חינוך</label>
                  <Input type='text' value={this.state.docData.education_type} />
                </Col>
                <Col>
                  <label className='form-control-label'>סוג מוסד</label>
                  <Input type='text' value={this.state.docData.institution_type} />
                </Col>
              </Row>
              <Row>
                <Col>
                  <label className='form-control-label'>מצב נוכחי</label>
                  <Input type='text' value={this.state.docData.status} />
                </Col>
              </Row>
            </div>
        </div>
      </div>
    )
  }

};

export default Model;
