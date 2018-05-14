// @flow
import React from 'react';
import {
  Container,
  Row,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import classNames from 'classnames';
import firebase from './firebase.js';

type State = {
  doc_types: [],
  styles: {},
  docsProvider: String
}

type Props = {

}

class ImportWizard extends React.Component<Props, State> {

  state = {
    doc_types: [],
    dropdownOpen: false,
    docsProvider: ''
  };

  constructor(props) {
    super(props);

    this.styles = {
      navItem : {
        width: '33.3333%'
      },
      movingTab: {
        width: '250px',
        transform: 'translate3d(-8px, 0px, 0px)',
        transition: 'transform 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
      }
    }

    this.movingTab = React.createRef();
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

  toggle() {
     this.setState(prevState => ({
       dropdownOpen: !prevState.dropdownOpen
     }));
   }

   onNext() {
     console.log('onNext');
   }

   highligthTab(e, tabNum) {

     const tab = e.target;
     const _m = (tabNum - 1) * 8; // 'edge' calculated for tabNum as: 0 = -8; 1 = 0; 2 = 8
     const offset = tab.offsetWidth;

     const elem = this.movingTab.current;
     elem.innerText = tab.innerText;
     var translate = `translate3d(${_m + offset * tabNum}px, 0px, 0px)`;
     elem.style.transform = translate;

   }

   onProviderSelected = (provider) => {
     this.setState({
       docsProvider: provider
     })
   }

  render(): React.Node {

    let nextButtonClassName = classNames('btn btn-next btn-fill btn-success btn-wd', {
      'disabled': this.state.docsProvider == ''
    });

    let prevButtonClassName = classNames('btn btn-previous btn-fill btn-default btn-ws', {
      'disabled': true
    })

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content'>
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
                            <ul className='nav nav-pills' role="tablist">
                              <li style={this.styles.navItem}
                                  onClick={ (e) => ::this.highligthTab(e, 0)}>
                                <a href='#select_provider' className='nav-link nav-item active'
                                    data-toggle="tab" role="tab"
                                    aria-selected='true'>Select provider</a>
                              </li>
                              <li style={this.styles.navItem}
                                  onClick={ (e) => ::this.highligthTab(e, 1)}>
                                <a href='#select_file' className='nav-link nav-item'
                                   data-toggle="tab" role="tab"
                                   aria-selected="false">Select file</a>
                              </li>
                              <li style={this.styles.navItem} ref={ (el) => this.tab }
                                  onClick={ (e) => ::this.highligthTab(e, 2)}>
                                <a href='#confirm' className='nav-link nav-item'
                                   data-toggle="tab" role="tab"
                                   aria-selected="false">Confirm</a>
                              </li>
                            </ul>
                            <div style={this.styles.movingTab}
                                  ref={this.movingTab}
                                  className='moving-tab'>Select provider</div>
                          </div>
                          <div className='tab-content'>
                            <div className='tab-pane active' id='select_provider'>
                              <div className='row'>
                                <h4 className='info-text'>Who is data provider for uploaded file?</h4>
                                <Dropdown isOpen={this.state.dropdownOpen} toggle={::this.toggle}>
                                  <DropdownToggle caret>
                                    Select Provider
                                  </DropdownToggle>
                                  <DropdownMenu>
                                    {
                                      this.state.doc_types.map( (docType, index) => {
                                        return <DropdownItem key={index} onClick={ ()=> ::this.onProviderSelected(docType) }>{docType}</DropdownItem>
                                      })
                                    }
                                  </DropdownMenu>

                                </Dropdown>
                              </div>
                            </div>
                            <div className='tab-pane' id='select_file'>
                            </div>
                            <div className='tab-pane' id='confirm'>
                            </div>
                          </div>
                          <div className='wizard-footer'>
                            <div className='float-right'>
                              <input type='button' name='next' value='Next'
                                className={nextButtonClassName}
                                onClick={::this.onNext}>
                              </input>
                            </div>
                            <div className='float-left'>
                              <input type='button' name='previous' value='Previous'
                                className={prevButtonClassName}/>
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
              </div>
           </div>
  }

};

export default ImportWizard;
