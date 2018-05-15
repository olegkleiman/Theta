// @flow
import React from 'react';
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
        <div className='content'>
          <Row>
            <div className='col-12'>
              <Card>
                <div className='card-header'>
                  <h4 style={this.styles.formTitle}>Inspection Form</h4>
                </div>
                <div className='card-body'>
                  <form onSubmit={::this.onFormSubmit}>
                    <Row>
                      <div className='col col-lg-2'>
                        <h4 className='info-text'>Kindergarten</h4>
                      </div>
                      <div className='col col-lg-4'>
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={::this.toggle}>
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
                      </div>
                    </Row>
                    <Row>
                      <div className='col col-lg-2'>
                        <h4>Instructor Name</h4>
                      </div>
                      <div className='col col-lg-4'>
                        <Input placeholder='type here' />
                      </div>
                    </Row>
                    <Row>
                        <div className='col col-lg-3'>
                          Subject 1
                        </div>
                        <div className='col col-lg-3'>
                          <FormGroup check>
                            <Label check>
                              <Input type='radio'name='radio1'/>
                              First Radio
                            </Label>
                          </FormGroup>
                        </div>
                        <div className='col col-lg-3'>
                          <FormGroup check>
                            <Label check>
                              <Input type='radio' name='radio1' />
                              Second Radio
                            </Label>
                          </FormGroup>
                        </div>
                        <div className='col col-lg-3'>
                          <FormGroup check>
                            <Label check>
                              <Input type='radio' name='radio1' />
                                Third Radio
                            </Label>
                          </FormGroup>
                        </div>
                    </Row>
                    <Row>
                      <div className='col col-lg-3'>
                        Subject 2
                      </div>
                      <div className='col col-lg-3'>
                        <FormGroup check>
                          <Label check>
                            <Input type='radio'name='radio2'/>
                            2. First Radio
                          </Label>
                        </FormGroup>
                      </div>
                      <div className='col col-lg-3'>
                        <FormGroup check>
                          <Label check>
                            <Input type='radio' name='radio2' />
                            2. Second Radio
                          </Label>
                        </FormGroup>
                      </div>
                      <div className='col col-lg-3'>
                        <FormGroup check>
                          <Label check>
                            <Input type='radio' name='radio2' />
                              2. Third Radio
                          </Label>
                        </FormGroup>
                      </div>
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
                  </form>
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
