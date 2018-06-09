// @flow
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
import XLSX from 'xlsx';
import InputFile from './InputFile.jsx';
import FileMetadata from "./FileMetadata.jsx"
import Upload from "./Upload.jsx"
import Confirm from "./Confirm.jsx"
import SheetTab from "./SheetTab.jsx"

type State = {
  doc_types: [],
  styles: {}
}

type Props = {

}

class ImportWizard extends React.Component<Props, State> {

  state = {
    doc_types: [],
    dropdownOpen: false
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

  metadataChoosen= (doc) =>{
      var self = this;
      self.setState({
        doc: doc
      })
  }
  fileChoosen = (files, workbook) => {
    var self = this;
    self.setState({
      files: files,
      workbook: workbook,
    })
  }
  // fileChoosen = (files, worksheet, headers) => {
  //   var self = this;
  //   self.setState({
  //     files: files,
  //     worksheet: worksheet,
  //     headers: headers,
  //   })
  // }

objectCreated = (jsonObj) => {
  this.setState({
    jsonData: jsonObj
  })
}
  render(): React.Node {

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
                                   aria-selected="false">Upload</a>
                              </li>
                            </ul>
                            <div style={this.styles.movingTab}
                                  ref={this.movingTab}
                                  className='moving-tab'>Select provider</div>
                          </div>
                          <div className='tab-content'>
                            <div className='tab-pane active' id='select_provider'>
                              <FileMetadata onChange={::this.metadataChoosen}/>
                              {this.state.doc &&
                                <InputFile onChange={::this.fileChoosen}
                                           doc={this.state.doc}/>}
                            </div>
                            <div className='tab-pane' id='select_file'>
                              {this.state.workbook &&
                                <SheetTab wb={this.state.workbook}
                                          expectedSheets={this.state.doc.sheets}
                                          onCreateObject={::this.objectCreated}/>}
                            </div>
                            <div className='tab-pane' id='confirm'>
                              {this.state.jsonData &&
                                 <Upload file={this.state.files[0]}
                                         metadata={this.state.doc.metadata}
                                         jsonData={this.state.jsonData}/>}
                            </div>
                          </div>
                          <div className='wizard-footer'>
                            <div className='float-right'>
                              <input type='button' name='next' value='Next'
                                className='btn btn-next btn-fill btn-success btn-wd'
                                onClick={::this.onNext}>
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
              </div>
           </div>
  }

};

export default ImportWizard;
