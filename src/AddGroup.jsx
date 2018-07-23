// @flow
import React from 'react';
import { Button, Row, Col, Container, Form, FormGroup,
  Card, CardBody, CardTitle,
  Input, InputGroup, InputGroupAddon
} from 'reactstrap';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';
import _ from 'moment/locale/he';
import classNames from 'classnames';
import firebase from './firebase.js';
import withAuth from './FirebaseAuth';

type State = {
  unitName: String,
  fromDate: moment,
  tillDate: moment,
  invalidField: String
}

class AddGroup extends React.Component<{}, State> {

  state = {
    unitName: '',
    invalidField: ''
  }

  async componentDidMount() {

    const unitId = this.props.match.params.unitid;
    let unitName = '<Unknown>';

    try {
      const resp = await firebase.firestore().collection('units').doc(unitId)
                         .get();
      const docData = resp.data();
      unitName = docData.name_he;
    }
    catch( err ) {
        console.error(err);
    }

    this.setState({
      unitName: unitName
    })

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
      this.setState({
        tillDate: moment(_date)
      });
    }
  }

  validateGroup(group) {

    const unitId = this.props.match.params.unitid;

    if( moment(group.opened).isAfter(moment(group.openedTill)) ) {
      group.validated = false;
      group.invalidField = 'openedTill';
      return group;
    }

    return new Promise( (resolve, reject) => {

      try {
        firebase.firestore().collection('units')
                    .doc(unitId).collection('groups')
                    .where('symbol', '==', group.symbol)
                    .get()
                    .then( query => {

                      if( query.docs.length > 0 ) {
                        group.validated = false;
                        group.invalidField = 'symbol';
                        resolve(group)
                      } else {
                        group.validated = true;
                        resolve(group)
                      }

                    })

      } catch( err ) {
        reject(err);
      }

    })

  }

  onFormSubmit = async(event) => {

    event.preventDefault(); // stop from further submit

    const group = {
      name: event.target.groupName.value,
      symbol: event.target.symbol.value,
      capacity: event.target.groupCapacity.value,
      opened: this.state.fromDate.toDate(),
      openedTill: this.state.tillDate.toDate(),
      price: event.target.price.value,
      sec_role: `group_${event.target.symbol.value}`
    }

    try {

      const _group = await ::this.validateGroup(group)
      if( !_group.validated ) {

        this.setState({
          invalidField: group.invalidField
        },
        () => {
                console.log('Form is invalid.');
        });

        return;
      }

      const unitId = this.props.match.params.unitid;

      // Add new group to Firestore
      const doc = await firebase.firestore().collection('units')
                      .doc(unitId).collection('groups')
                      .add(group);

      // Grant permissions to the current user
      let response = await firebase.firestore().collection('users')
                                      .where("email", "==", this.props.userEMail)
                                      .get();
      if( response.docs.length != 0 ) {
        const userDoc = response.docs[0];
        const secRoles = this.props.secRoles;
        secRoles.push(`group_${group.symbol}`);

        await firebase.firestore().collection('users')
              .doc(userDoc.id)
              .update({
                 sec_roles: secRoles
              })

        // Statuses of newly created group for Rishumon
        // 1 - Open
        // 2 - Till date was expired
        // 3 - Group is full
        // 4 - Close

        let headers = new Headers();
        headers.append('Authorization', 'Basic ZWxhbXlhbjExNTplbGFteWFuMTE1');
        headers.append('Content-Type', 'application/json');

        await fetch('https://rishumon.com/api/elamayn/edit_class.php?secret=Day1!', {
          //headers: headers,
          mode: 'no-cors',
          method: 'POST',
          body:
              {
              	"groupSymbol": group.symbol,
              	"description": group.name,
              	"status": "1",
              	"price": group.price
          }
        })

        this.props.history.push(`/dashboard/units`);

      }

    } catch( err ) {
      console.error(err);
    };

  }

  render() {

    let isThisField = this.state.invalidField === 'symbol';
    const groupSymbolClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    });

    isThisField = this.state.invalidField === 'openedTill';
    const tillClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    });

    return (<div>
      <div className='panel-header panel-header-sm'></div>
      <div className='content container h-100'>
        <Row>
          <Col className='col-md-12'>
            <Card body className="text-center">
              <div className='card-header'>
                <h5 className='title'>Create new Group for {this.state.unitName}</h5>
              </div>
              <CardBody>
                <Card>
                    <CardBody>
                      <Form onSubmit={::this.onFormSubmit}>
                        <Container>
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>Group Name</div>
                            </Col>
                            <Col md={{ size: 4 }}>
                              <Input id='groupName' name='groupName'></Input>
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              Symbol
                            </Col>
                            <Col md='4'>
                                <Input id='symbol' name='symbol'
                                        type='number' placeholder="only numbers" />
                            </Col>
                            <Col md='4' invalid={(this.state.invalidField === 'symbol').toString()}
                              className={groupSymbolClassNames}>
                              Group with this symbol is already exists
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              Opened From
                            </Col>
                            <Col md='4'>
                              <Datetime closeOnSelect={true}
                                        onChange={::this._fromDateChanged}
                                        local='he' />
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2}} className="text-right my-auto">
                              Opened Till
                            </Col>
                            <Col md='4'>
                              <Datetime closeOnSelect={true}
                                        onChange={::this._tillDateChanged}
                                        local='he' />
                            </Col>
                            <Col md='4' invlalid={(this.state.invalidField === 'openedTill').toString()}
                                className={tillClassNames}>
                              No time left to enjoy this group :)
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              Capacity
                            </Col>
                            <Col md='4'>
                              <Input id='groupCapacity' name='groupCapacity'
                                     type='number' placeholder="only numbers" />
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              Price
                            </Col>
                            <Col md='4'>
                              <InputGroup>
                                <Input id='price' name='price'
                                       type='number'
                                       placeholder="only numbers as money, e.g. 670, 670.65" />
                                <InputGroupAddon addonType="append">₪</InputGroupAddon>
                              </InputGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={{ size: 1, offset: 10}}>
                              <Button type="submit" color='primary'>Create</Button>
                            </Col>
                          </Row>
                        </Container>
                      </Form>
                    </CardBody>
                </Card>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>)
  }

};

export default withAuth(AddGroup);
