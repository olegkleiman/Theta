// @flow
import React from 'react';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import Datetime from 'react-datetime';
import moment from 'moment';
import firebase from './firebase.js';

type State = {
  fromDate: moment,
  tillDate: moment
}

class AddGroup extends React.Component {

  constructor(props) {

    super(props);

  }

  _fromDateChanged(_date: Date) {

    if( moment(_date).isValid() ) {
      this.setState({
        fromDate: moment(_date)
      });
    }
  }

  _tillDateChanged(_date: Date) {

    if( moment(_date).isValid() ) {
      // TBD
    }
  }

  onFormSubmit = (event) => {
    event.preventDefault(); // stop from further submit

    const group = {
      name: event.target.groupName.value,
      symbol: event.target.symbol.value,
      capacity: event.target.groupCapacity.value,
      opened: this.state.fromDate.toDate()
    }

    const unitId = this.props.match.params.unitid;

    firebase.firestore().collection('units').doc(unitId).collection('groups')
    .add(group)
    .then( doc => {
      console.log(doc);
    })
    .catch( err => {
      console.error(err);
    });

  }

  render() {
    return (<div>
      <div className='panel-header panel-header-sm'></div>
      <div className='content container h-100'>
        <Row>
          <Col className='col-md-12'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='title'>Create new Group</h5>
              </div>
              <div className='card-body'>
                <Row>
                  <div className='card'>
                    <div className='card-body'>
                      <Form onSubmit={::this.onFormSubmit}>
                        <Row>
                          <Col className='col-md-2'>
                            <div className='info-text'>Group Name</div>
                          </Col>
                          <Col className='col-md-4'>
                            <Input id='groupName' name='groupName'></Input>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            Symbol
                          </Col>
                          <Col>
                            <Input id='symbol' name='symbol'></Input>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            Opened From
                          </Col>
                          <Col>
                            <Datetime closeOnSelect={true}
                                      onChange={::this._fromDateChanged}
                                      local='he' />
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            Closed At
                          </Col>
                          <Col>
                            <Datetime closeOnSelect={true}
                                      onChange={::this._tillDateChanged}
                                      local='he' />
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            Capacity
                          </Col>
                          <Col>
                            <Input id='groupCapacity' name='groupCapacity'></Input>
                          </Col>
                        </Row>
                        <Row>
                          <div className='col col-lg-1'>
                            <Button type="submit" color='success'>Create</Button>
                          </div>
                        </Row>

                      </Form>
                    </div>
                  </div>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>)
  }

};

export default AddGroup;
