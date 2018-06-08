// @flow
import React from 'react';
import firebase from './firebase.js';
import classNames from 'classnames';

import Unit from './Unit';
import Groups from './Groups';

import {
  Button,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

type State = {
  units: [],
  selectedUnit: {
    name: String,
    id: String
  },
  dropdownOpen: Boolean
}

type Props = {

}

class Units extends React.Component<Props, State> {

  state = {
    units: [],
    selectedUnit: {
      name: '',
      id: ''
    },
    dropdownOpen: false
  };

  toggle() {
     this.setState(prevState => ({
       dropdownOpen: !prevState.dropdownOpen
     }));
   }

  componentDidMount() {

    const self = this;

    const getOptions = {
      source: 'server'
    }

    firebase.firestore().collection('units')
      .get(getOptions)
      .then( response => {

      const _units = [];

      response.docs.forEach( (unit) => {
        _units.push({
          name: unit.data().name,
          id: unit.id
        });
      });

      self.setState({
        units: _units
      })

    });
  }

  onUnitSelected = (unit) => {
    this.setState({
      selectedUnit: unit
    })
  }

  render() {

    let nextButtonClassName = classNames('btn btn-next btn-fill btn-success btn-wd', {
      'disabled': this.state.selectedUnit.name == ''
    });

    const dropdownTitle = this.state.selectedUnit.name == '' ? 'Select Unit'
                                                          : this.state.selectedUnit.name;

    let unit = this.state.selectedUnit.id == '' ? null
                : <Unit docId={this.state.selectedUnit.id} />

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>Units Management</h5>
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
                                  this.state.units.map( (unit, index) => {
                                      return <DropdownItem key={index}
                                                onClick={()=> ::this.onUnitSelected(unit)}>{unit.name}</DropdownItem>
                                  })
                                }
                              </DropdownMenu>
                            </Dropdown>
                          </Col>
                          <Col xs='10'>
                            {unit}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
           </div>
  }

}

export default Units;