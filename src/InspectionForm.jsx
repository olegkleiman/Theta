// @flow
import React from 'react';
import { Field, reduxForm } from 'redux-form';
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

  // toggle() {
  //   this.setState(prevState => ({
  //     dropdownOpen: !prevState.dropdownOpen
  //   }));
  // }

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

  //onKindergartenSelected = (kindergartenName: String) => {

  //   this.setState( prevState => ({
  //     selectedKindergarten: kindergartenName
  //   }));
  //
  // }

  renderDropdownList = ({ input, data, valueField, textField }) => {
    return <KindergartenSelector {...this.props} />
  }

  handleFileUpload = (event) => {
    this.setState({
      file: event.target.files[0]
    });
  }

  // componentDidMount() {
  //   const self = this;
  //
  //   firebaseApp.auth().onAuthStateChanged( (user) => {
  //     if( user ) {
  //
  //       self.userId = user.uid;
  //
  //       firebaseApp.firestore().collection('kindergartens')
  //       .get()
  //       .then( response => {
  //
  //           let list = [];
  //           response.docs.forEach( (doc) => {
  //             list.push(doc.data().name);
  //           });
  //
  //           self.setState({
  //             kindergartens: list
  //           })
  //
  //
  //       });
  //
  //     }
  //   });
  // }

  handleChange = (e) => {
    console.log(e.target.value);
  }

  //@readonly
  render() {

    const { handleSubmit } = this.props;

    return (
      <div>
      <form onSubmit={handleSubmit}>
        <Row>
          <div className='col col-lg-2'>
            <h4 className='info-text'>Kindergarten</h4>
          </div>
          <div className='col col-lg-4'>
            <FormGroup>
              <Input type='select' name='select'>
                <option value="select">select</option>
                <option value="other">...</option>
              </Input>
            </FormGroup>
            {/*}<Field name='kindergartedSelector' component={KindergartenSelector} label='one' />


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
          */}
          </div>
        </Row>
        <Row>
          <div className='col col-lg-2'>
            <h4>Instructor Name</h4>
          </div>
          <div className='col col-lg-4'>
            <Field name="instructorName" component={renderField} type="text" label='type here' />
          </div>
        </Row>
        <Row>
            <div className='col col-lg-3'>
              Subject 1
            </div>
            <div className='col col-lg-3'>

              <FormGroup check className='radio'>
                <Input type='radio' id='radio1' name='inst' />
                <Label check for='radio1'>First Radio</Label>
              </FormGroup>

            </div>
            <div className='col col-lg-3'>

              <FormGroup check className='radio'>
                  <Input type='radio' id='radio2' name='inst'/>
                  <Label check for='radio2'>Second Radio</Label>
              </FormGroup>

            </div>
            <div className='col col-lg-3'>

              <FormGroup check className='radio'>
                  <Input type='radio' id='radio3' name='inst' />
                  <Label check for='radio3'>Third Radio</Label>
              </FormGroup>

            </div>
        </Row>
        <Row>
          <div className='col col-lg-3'>
            Subject 2
          </div>
          <div className='col col-lg-3'>

            <FormGroup check className='radio'>
                <Input type='radio' id='radio4' name='inst2'/>
                <Label check for='radio4'>2. First Radio</Label>
            </FormGroup>

          </div>
          <div className='col col-lg-3'>

            <FormGroup check className='radio'>
                <Input type='radio' id='radio5' name='inst2' />
                <Label check for='radio5'>2. Second Radio</Label>
            </FormGroup>

          </div>
          <div className='col col-lg-3'>

            <FormGroup check className='radio'>
                <Input type='radio' id='radio6' name='inst2' />
                <Label check for='radio6'>2. Third Radio</Label>
            </FormGroup>

          </div>
        </Row>
        <Row>
          <div className='col col-lg-1'>
            <label>Remarks</label>
          </div>
          <div className='col col-lg-11'>
            <Field name='remarks' component='textarea' type='text' />
          </div>
        </Row>
        <Row>
          <Input type='file' onChange={::this.handleFileUpload} />
        </Row>

        <Row>
          <div className='col col-lg-1'>
            <Button type="submit" color='success'>Submit</Button>
          </div>
        </Row>

      </form>
      </div>
    )
  }
};

export default reduxForm({
  form: 'simple',
  validate,
  warn
})(InspectionForm);
