// @flow
import React from 'react';
import { Button, Row, Col, Container, Form, FormGroup,
  Card, CardBody, CardTitle,
  Input, InputGroup, InputGroupAddon
} from 'reactstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import 'react-widgets/dist/css/react-widgets.css';
import classNames from 'classnames';
import firebase from './firebase.js';
import withAuth from './FirebaseAuth';

type State = {
  invalidField: String,
  selectedAuthority: ?String,
  authorities: String[],
  authoritiesLoaded: Boolean,
  unitType: String
}

class AddUnit extends React.Component<{}, State> {

  state = {
    invalidField: '',
    selectedAuthority: '',
    authorities: [],
    authoritiesLoaded: false,
    unitType: ''
  }

  async componentDidMount() {
    const response = await firebase.firestore().collection('authorities')
                           .get();
    const docs = response.docs;
    const _docs = docs.map( doc => {
      const docData = doc.data();
      return {
        name: docData.name,
        region: docData.region
      }
    });

    this.setState({
      authorities: _docs,
      authoritiesLoaded: true
    });

  }

  onAuthorityChanged = (authority) => {
    this.setState({
      selectedAuthority: authority.name
    });
  }

  onFormSubmit = async(event) => {

    event.preventDefault(); // stop from further submit

    const symbol = event.target.symbol.value;

    const unit = {
      authority: this.state.selectedAuthority,
      name_he: event.target.unitName.value,
      symbol: symbol,
      sec_role: 'unit_' + symbol,
      type: this.state.unitType,
      education_type: 'edu_type'
    }

    const _unit = await ::this.validateUnit(unit);
    if( !_unit.validated ) {

      this.setState({
        invalidField: unit.invalidField
      },
      () => {
              console.log('Form is invalid.');
      });

      return;

    }

    try {

      // Add new group to Firestore
      // const doc = await firebase.firestore().collection('units')
      //                 .add(unit);

      // Grant permissions to the current user
      let response = await firebase.firestore().collection('users')
                                      .where("email", "==", this.props.userEMail)
                                      .get();
      if( response.docs.length != 0 ) {

        const userDoc = response.docs[0];
        const secRoles = this.props.secRoles;
        secRoles.push(unit.sec_role);

        // await firebase.firestore().collection('users')
        //       .doc(userDoc.id)
        //       .update({
        //          sec_roles: secRoles
        //       });

        this.props.history.push(`/dashboard/units`);

      }

    } catch( err ) {

    }

  }

  validateUnit(unit) {
    unit.validated = true;
    return Promise.resolve(unit);
  }

  render() {

    const unitTypes = ['בי"ס', 'גן', 'בי"ס יוח"א '];

    let isThisField = this.state.invalidField === 'symbol';
    const symbolClassNames = classNames({
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
                  <h5 className='title'>הוספת מוסד חדש</h5>
                </div>
                <CardBody>
                  <Card>
                    <CardBody>
                      <Form onSubmit={::this.onFormSubmit}>
                        <Container>
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>רשות</div>
                            </Col>
                            <Col md='4' className="text-left">
                              <DropdownList busy={!this.state.authoritiesLoaded}
                                textField='name'
                                groupBy='region'
                                data={this.state.authorities}
                                onChange={ value => ::this.onAuthorityChanged(value) }/>
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>שם מוסד</div>
                            </Col>
                            <Col md={{ size: 4 }}>
                              <Input id='unitName' name='unitName'></Input>
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              סמל
                            </Col>
                            <Col md='4'>
                                <Input id='symbol' name='symbol'
                                        type='number' placeholder="רק מספרים שלמים" />
                            </Col>
                            <Col md='4' invalid={(this.state.invalidField === 'symbol').toString()}
                              className={symbolClassNames}>
                              Unit with this symbol is already exists
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>סוג מוסד</div>
                            </Col>
                            <Col md='4' className="text-left">
                              <DropdownList
                                data={unitTypes}
                                onChange={ value => this.setState({
                                                                    unitType: value
                                                                  }) }/>
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 1, offset: 10}}>
                              <Button type="submit" color='primary'>הוסף</Button>
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
      </div>
    )
  }

}

export default withAuth(AddUnit);
