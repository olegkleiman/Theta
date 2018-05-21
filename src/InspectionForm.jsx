// @flow
import React from 'react';
import {
  Container,
  Button,
  ButtonGroup,
  Row,
  Card,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormText,
  FormGroup,
  Label
} from 'reactstrap';
import firebaseApp from './firebase.js';

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

  onKindergartenSelected = (kindergartenName: String) => {
    console.log(kindergartenName);
    this.setState( prevState => ({
      selectedKindergarten: kindergartenName
    }));

  }

  handleFileUpload = (event) => {
    this.setState({
      file: event.target.files[0]
    });
  }

  onFormSubmit = (event) => {
    event.preventDefault(); // stop form submit

    console.log(event.target.instructorName.value);
    console.log(event.target.journal.value);
    console.log(event.target.calendar.value);
    console.log(this.state.selectedKindergarten);

    this.fileUpload(this.state.file);
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
                    <FormGroup>
                        <Label for='kinergartenName'>Kindergarten</Label>
                        <Dropdown id='kinergartenName' name='kinergartenName'
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
                        <FormText>Select from the list</FormText>
                    </FormGroup>

                    <FormGroup>
                      <Label for='instructorName'>Instructor Name</Label>
                      <Input id='instructorName' name='instructorName' />
                      <FormText>Full name of the person</FormText>
                    </FormGroup>

                    <Row>
                      <div className='col-3 offset-md-3 text-center'>Exists, normal
                      </div>
                      <div className='col-3 text-center'>Exists, abnormal
                      </div>
                      <div className='col-3 text-center'>Not Exists
                      </div>
                    </Row>
                    <Row>
                        <FormGroup check className='col-3'>
                        Journal
                        </FormGroup>
                        <FormGroup check className='col-3 text-center'>
                          <Input type='radio'name='journal' value='1'/>{' '}
                        </FormGroup>
                        <FormGroup check className='col-3 text-center'>
                          <Input type='radio'name='journal' value='2'/>{' '}
                        </FormGroup>
                        <FormGroup check className='col-3 text-center' >
                          <Input type='radio'name='journal' value='3'/>{' '}
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup check className='col-3'>
                        Calendar
                        </FormGroup>
                        <FormGroup check className='col-3 text-center'>
                           <Input type='radio'name='calendar'/>
                        </FormGroup>
                        <FormGroup check className='col-3 text-center'>
                          <Input type='radio' name='calendar' />
                        </FormGroup>
                        <FormGroup check className='col-3 text-center'>
                          <Input type='radio' name='calendar' />
                        </FormGroup>
                    </Row>
                    <Row>
                      <div className='col col-lg-12'>
                        <Input placeholder='remarks' />
                      </div>
                    </Row>
                    <Row>
                      <Input type='file' onChange={::this.handleFileUpload} />
                    </Row>
                    <Row>
                      <div className='col col-lg-1'>
                        <Button type='submit' color='success'>Submit</Button>
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
