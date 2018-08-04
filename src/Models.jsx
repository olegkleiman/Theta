// @flow
import React from 'react';
import firebase from './firebase.js';

import {
  Button,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import Model from './Model';

type State = {
  models: [],
  selectedModel: {
    modelNumber: String,
    id: ''
  },
  dropdownOpen: Boolean
}

class Models extends React.Component<{}, State> {

  state = {
    models: [],
    selectedModel: {
      modelNumber: '',
      id: ''
    },
    dropdownOpen: false
  }

  componentDidMount() {

    const self = this;

    const getOptions = {
      source: 'server'
    }

    firebase.firestore().collection('models')
      .get(getOptions)
      .then( response => {

        const _models = [];

        response.docs.forEach( (model) => {
          const modelData = model.data();
          _models.push({
            modelNumber: modelData.number,
            id: model.id
          });
        });

        self.setState({
          models: _models
        })

      });
  }

  toggle() {
     this.setState(prevState => ({
       dropdownOpen: !prevState.dropdownOpen
     }));
 }

 onModelSelected = (model) => {
   this.setState({
     selectedModel: model
   })

 }

 render() {

    const dropdownTitle = this.state.selectedModel.modelNumber == '' ? 'Select Model'
                                                          : this.state.selectedModel.modelNumber;
    let model = this.state.selectedModel.modelNumber == '' ? null
                : <Model docId={this.state.selectedModel.id} />

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>Models</h5>
                      </div>
                      <div className='card-body'>
                        <Row>
                          <Col xs='2'>
                            <Dropdown isOpen={this.state.dropdownOpen} toggle={::this.toggle}>
                              <DropdownToggle caret>
                                {dropdownTitle}
                              </DropdownToggle>
                              <DropdownMenu>
                                {
                                  this.state.models.map( (model, index) => {
                                      return <DropdownItem key={index}
                                                onClick={()=> ::this.onModelSelected(model)}>{model.modelNumber}</DropdownItem>
                                  })
                                }
                              </DropdownMenu>

                            </Dropdown>
                          </Col>
                          <Col xs='10'>
                            {model}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
           </div>
  }

};

export default Models;
