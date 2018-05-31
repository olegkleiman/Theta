// @flow
import React from 'react';
//import { Field, reduxForm } from 'redux-form';
import {
  Container,
  Button,
  Row,
  Card,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormText,
  FormControl,
  FormGroup,
  Label
} from 'reactstrap';
import firebaseApp from '../firebase.js';

import KindergartenSelector from './KindergartenSelector';

const validate = values => {
  const errors = {};

  if( !values.instructorName ) {
    errors.instructorName = 'Required'
  } else if( values.instructorName.length < 2 ) {
    errors.instructorName = 'Must be more than 2 chars'
  }

  return errors;
}

const warn = values => {
  const warnings = {};

  return warnings;
}

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning }
}) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      { touched &&
        ((error && <div><i className='now-ui-icons ui-1_bell-53 btn-outline-danger'></i><span>{error}</span></div>) ||
        (warning && <span>{warninig}</span>))}
    </div>
  </div>
)

type State = {
  kindergartens: [],
  selectedKindergarten: String,
  dropdownOpen: Boolean,
  file: Object
}

class InspectionForm extends React.Component<State> {

  state = {
    dropdownOpen: false,
    kindergartens: [],
    selectedKindergarten: 'Please Select',
    file: null
  };

  constructor(props) {
      super(props);

      this.styles = {
        formTitle: {
          textAlign: 'center'
        }
      }
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  fileUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const storage = firebaseApp.storage().ref();
    // Do not store the file with the same name to prevent clashes
    // - generate unique file name
    const tokens = file.name.split('.');
    const fileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fileRef = storage.child(this.userId + '/inspections/' + fileName + '.' + tokens[1]);
    const metadata = {
      contentType: file.type
    };

    fileRef.put(file, metadata)
    .then( snapshot => {
      console.log('Uploaded');
    })
    .catch( error => console.error(error) );
  }

  onKindergartenSelected = (kindergartenName: String) => {

    this.setState( prevState => ({
      selectedKindergarten: kindergartenName
    }));

  }

  handleFileUpload = (event) => {
    this.setState({
      file: event.target.files[0]
    });
  }

  componentDidMount() {
    const self = this;

    firebaseApp.auth().onAuthStateChanged( (user) => {
      if( user ) {

        self.userId = user.uid;

        firebaseApp.firestore().collection('kindergartens')
        .get()
        .then( response => {

            let list = [];
            response.docs.forEach( (doc) => {
              list.push(doc.data().name);
            });

            self.setState({
              kindergartens: list
            })


        });

      }
    });
  }

  handleChange = (e) => {
    console.log(e.target.value);
  }

  onFormSubmit = (event) => {
    event.preventDefault(); // stop from further submit

    console.log(event.target.instructorName.value);
    console.log(event.target.journal.value);
    console.log(event.target.calendar.value);
    console.log(event.target.remarks.value);
    console.log(this.state.selectedKindergarten);
  }

  render() {

    return (
      <div>
        <div className='panel-header panel-header-sm'></div>
        <div className='content container h-100'>
          <Row>
            <div className='col-12'>
              <Card>
                <div className='card-header'>
                  <h4 style={this.styles.formTitle}>Kindergarten Inspection Form</h4>
                </div>
                <div className='card-body'>
                  <Form onSubmit={::this.onFormSubmit}>
                    <Row>
                      <div className='col col-lg-2'>
                        <h4 className='info-text'>Kindergarten</h4>
                      </div>
                      <div className='col col-lg-4'>
                        <FormGroup>
                          <Dropdown id='kindergartenName' name='kindergartenName'
                                  isOpen={this.state.dropdownOpen}
                                  toggle={::this.toggle}>
                          <DropdownToggle caret>
                            {this.state.selectedKindergarten}
                          </DropdownToggle>
                          <DropdownMenu>
                            {
                              this.state.kindergartens.map ( (item ,index) => {
                                return <DropdownItem key={index}
                                                      onClick={ ()=> ::this.onKindergartenSelected(item) }>
                                          {item}
                                      </DropdownItem>
                              })
                            }
                          </DropdownMenu>
                        </Dropdown>
                        </FormGroup>
                      </div>
                    </Row>
                    <Row>
                      <div className='col col-lg-2'>
                        <h4 className='info-text'>Instructor Name</h4>
                      </div>
                      <div className='col col-lg-4'>
                        <FormGroup>
                          <Input id='instructorName' name='instructorName'></Input>
                        </FormGroup>
                      </div>
                    </Row>
                    <Row>
                      <div className='col-3 offset-md-3 text-center'>Exists, normal</div>
                      <div className='col-3 text-center'>Exists but abnormal</div>
                      <div className='col-3 text-center'>Not exists</div>
                    </Row>
                    <br />
                    <Row>
                        <FormGroup check className='col-3'>
                          Journal
                        </FormGroup>
                          <FormGroup check className='radio col-3 text-center'>
                            <Input type='radio' id='radio1' name='journal' value='1' />
                            <Label check for='radio1'>&nbsp;</Label>
                          </FormGroup>

                          <FormGroup check className='radio col-3 text-center'>
                              <Input type='radio' id='radio2' name='journal' value='2'/>
                              <Label check for='radio2'>&nbsp;</Label>
                          </FormGroup>

                          <FormGroup check className='radio col-3 text-center'>
                              <Input type='radio' id='radio3' name='journal' value='3'/>
                              <Label check for='radio3'>&nbsp;</Label>
                          </FormGroup>
                    </Row>
                    <Row>

                      <FormGroup check className='col-3'>
                        Calendar
                      </FormGroup>
                      <FormGroup check  className='col-3 text-center'>
                        <Input type='radio' name='calendar' value='1' />
                      </FormGroup>
                      <FormGroup check  className='col-3 text-center'>
                        <Input type='radio' name='calendar' value='2' />
                      </FormGroup>
                      <FormGroup check  className='col-3 text-center'>
                        <Input type='radio' name='calendar' value='3' />
                      </FormGroup>

                    </Row>
                    <br />
                    <Row>
                      <div className='col col-lg-2'>
                        <h4 className='info-text'>Remarks</h4>
                      </div>
                      <div className='col col-lg-10'>
                        <Input name='remarks' />
                      </div>
                    </Row>
                    <br />
                    <Row>
                      <Input type='file' onChange={::this.handleFileUpload} />
                    </Row>
                    <Row>
                      <div className='col col-lg-1'>
                        <Button type="submit" color='success'>Submit</Button>
                      </div>
                    </Row>
                  </Form>
                </div>
              </Card>
            </div>
          </Row>
        </div>
      </div>
    )
  }
};

export default InspectionForm;
