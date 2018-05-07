// @flow
import React from 'react';
import {
  Container,
  Row,
  Card
} from 'reactstrap';
import firebase from './firebase.js';

type State = {
  doc_types: [],
  styles: {}
}

type Props = {

}

class ImportWizard extends React.Component<State, Props> {

  constructor() {
    super();

    this.state = {
      doc_types: []
    }

    this.styles = {
      navItem : {
        width: '33.33%'
      },
      movingTab: {
        width: '250px',
        transform: 'translate3d(-8px, 0px, 0px)',
        transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
      }
    }
  }

  componentDidMount() {

    const self = this;

    firebase.auth().onAuthStateChanged( (user) => {
      if( user ) {
        firebase.firestore().collection('document_types')
          .get()
          .then( response => {

            let docTypes = [];
            response.docs.forEach( (docType) => {
              docTypes.push(docType.data().category);
            });

            self.setState({
              doc_types: docTypes
            })

          });
      }
    });
  }

  render() {

    return <div className='image-container containerShift'>
              <Container>
                <Row>
                  <div className='col-lg-8 offset-lg-2'>
                    {/* Wizard container */}
                    <div className='wizard-container'>
                      <div className='card wizard-card' data-color='blue' id='wizardProfile'>
                        <form noValidate>
                          <div className='wizard-header'>
                            <h3 className='wizard-title'>Upload file</h3>
                            <h5>The uploads are stored, validated and parsed</h5>
                          </div>
                          <div className='wizard-navigation'>
                            <ul className='nav nav-pills'>
                              <li style={this.styles.navItem} className='active'>
                                <a href='#about' data-toggle='tab' aria-expanded='true'>Select provider</a>
                              </li>
                              <li style={this.styles.navItem}>
                                <a href='#account' data-toggle='tab'>Select file</a>
                              </li>
                              <li style={this.styles.navItem}>
                                <a href='#address' data-toggle='tab'>Confirm</a>
                              </li>
                            </ul>
                            <div style={this.styles.movingTab} className='moving-tab'>Select provider</div>
                          </div>
                          <div className='tab-content'>
                            <div className='tab-pane active' id='about'>
                              <div className='row'>
                                <h4 className='info-text'>Who is data provider for uploaded file?</h4>
                                <div className='dropdown'>
                                  <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Select Provider
                                  </button>

                                  <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    {
                                      this.state.doc_types.map( (docType, index) => {
                                        return <a className="dropdown-item" key={index} href="#">{docType}</a>
                                      })
                                    }
                                  </div>

                                </div>
                              </div>
                            </div>
                            <div className='tab-pane' id='accont'>
                            </div>
                            <div className='tab-pane' id='address'>
                            </div>
                          </div>
                          <div className='wizard-footer'>
                            <div className='float-right'>
                              <input type='button' name='next' value='Next'
                                className='btn btn-next btn-fill btn-success btn-wd'>
                              </input>
                            </div>
                            <div className='float-left'>
                              <input type='button' name='previous' value='Previous'
                                className='btn btn-previous btn-fill btn-default btn-ws disabled'/>
                            </div>
                            <div className='clearfix'>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                    {/* Wizard container */}
                  </div>
                </Row>
              </Container>
           </div>
  }

};

export default ImportWizard;
