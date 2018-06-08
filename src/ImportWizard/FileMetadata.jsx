import React from 'react';
import {
  Container,
  Row,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormGroup,
  CustomInput,
  Label,
  Form
} from 'reactstrap';
import firebase from '../firebase.js';

class FileMetadata extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      doc_types: [],
      dropdownOpen: false
    };

  }

  componentDidMount() {

    const self = this;

    firebase.auth().onAuthStateChanged( (user) => {
      if( user ) {
        let docRef = firebase.firestore().collection('document_types');
        docRef.get()
          .then( response => {

            let docTypes = [];
            response.docs.forEach( (docType) => {
              docTypes.push({
                id: docType.id,
                ...docType.data()
              });
            });

            // var columns = [];
            // docTypes[0].sheets[0].columns.map((c, i) => {
            //   if (i !== 7) {
            //     columns.push(c);
            //   }
            // });
            // docTypes[0].sheets[0].columns = columns;
            // let category = docTypes[0].category;
            // let metadata = docTypes[0].metadata;
            // let sheets = docTypes[0].sheets
            // let doc = {
            //   category,
            //   sheets,
            //   metadata,
            // }
            // docRef.doc(docTypes[0].id).set(doc).then( response => {
            //   console.log(response);
            // });
            self.setState({
              doc_types: docTypes
            })

          });
      }
    });
  }
  toggle(e) {
    console.log(e.target.tabIndex);
     this.setState(prevState => ({
       dropdownOpen: !prevState.dropdownOpen
     }));
   }

  onClick(e){
    this.props.onChange(this.state.doc_types[e.target.tabIndex])

  }

  render () {
    return(
      <div className='row'>
        <h4 className='info-text'>Who is data provider for uploaded file?</h4>
        <Dropdown  isOpen={this.state.dropdownOpen} toggle={::this.toggle}>
          <DropdownToggle caret>
            Select Provider
          </DropdownToggle>
          <DropdownMenu>
            {
              this.state.doc_types.map( (docType, index) => {
                return <DropdownItem onClick={::this.onClick} key={index} >{docType.category}</DropdownItem>
              })
            }
          </DropdownMenu>

        </Dropdown>
      </div>
    )
  }

}

export default FileMetadata
