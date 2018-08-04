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
  models: String[],
  modelsLoaded: Boolean,
  selectedModel: String,
  unitType: String,
  eduType: String
}

@withAuth
export default
class AddUnit extends React.Component<{}, State> {

  state = {
    invalidField: '',
    selectedAuthority: '',
    authorities: [],
    authoritiesLoaded: false,
    models: [],
    modelsLoaded: false,
    selectedModel: '',
    unitType: '',
    eduType: ''
  }

  async componentDidMount() {

    let _authorities = [];
    let _authoritiesLoaded = false;
    try {

      const authorities = await firebase.firestore().collection('authorities')
                             .get();
      const authoritiesDocs = authorities.docs;
      _authorities = authoritiesDocs.map( doc => {
        const docData = doc.data();
        return {
          name: docData.name,
          region: docData.region
        }
      });
      _authoritiesLoaded = true;

    } catch( err ) {
      console.error(err);
    }

    let _models = [];
    let _modelsLoaded = false;
    try {

      const models = await firebase.firestore().collection('models')
                             .get();
      const modelDocs = models.docs;
      _models = modelDocs.map( doc => {
        const modelData = doc.data();
        return  modelData.number;
      });
      _modelsLoaded = true;

    } catch( err ) {
      console.error(err);
    }

    this.setState({
      authorities: _authorities,
      authoritiesLoaded: _authoritiesLoaded,
      models: _models,
      modelsLoaded: _modelsLoaded
    });

  }

  onAuthorityChanged = (authority) => {
    this.setState({
      selectedAuthority: authority.name
    });
  }

  onModelChanged = (modelName) => {
    this.setState({
      selectedModel: modelName
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
      model: this.state.selectedModel,
      type: this.state.unitType,
      education_type: this.state.eduType
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

      // Add new unit to Firestore
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
      console.error(err);
    }

  }

  validateUnit(unit) {

    return new Promise( (resolve, reject) => {

      try {
        firebase.firestore().collection('units')
                    .where('symbol', '==', unit.symbol)
                    .get()
                    .then( query => {

                      if( query.docs.length > 0 ) {
                        unit.validated = false;
                        unit.invalidField = 'symbol';
                        resolve(group);
                      } else {
                        unit.validated = true;
                        resolve(unit);
                      }

                    })
        } catch( err ) {
          reject(err);
        }
      })

  }

  render() {

    const unitTypes = ['בי"ס', 'גן', 'בי"ס יוח"א '];
    const eduTypes = ['רגיל', 'מיוחד'];

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
                              <DropdownList filter busy={!this.state.authoritiesLoaded}
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
                              מודל
                            </Col>
                            <Col md='4' className="text-left">
                              <DropdownList
                                data={this.state.models}
                                busy={!this.state.modelsLoaded}
                                onChange={ model => ::this.onModelChanged(model) }
                                />
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
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>סוג חינוך</div>
                            </Col>
                            <Col md='4' className="text-left">
                              <DropdownList
                                data={eduTypes}
                                onChange={ value => this.setState({
                                                                    eduType: value
                                                                  }) }/>
                            </Col>
                          </Row>
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
