// @flow
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import firebase from './firebase.js';
import classNames from 'classnames';

import Groups from './Groups.jsx';

import {
  Button,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

type State = {
  units: [],
  selectedUnit: String,
  dropdownOpen: Boolean
}

type Props = {

}

class Units extends React.Component<Props, State> {

  state = {
    units: [],
    selectedUnit: '',
    dropdownOpen: false
  };

  toggle() {
     this.setState(prevState => ({
       dropdownOpen: !prevState.dropdownOpen
     }));
   }

  componentDidMount() {

    const self = this;

    firebase.firestore().collection('units')
      .get()
      .then( response => {

      const _units = [];

      response.docs.forEach( (unit) => {
        _units.push(unit.data().name);
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

  onNext() {

    this.props.dispatch({
      type: 'PAGE_NAVIGATED',
      data: {
        pageName: 'Groups of ' + this.state.selectedUnit
      }
    });

    this.props.history.push('/dashboard/groups');
  }

  render() {

    let nextButtonClassName = classNames('btn btn-next btn-fill btn-success btn-wd', {
      'disabled': this.state.selectedUnit == ''
    });

    const dropdownTitle = this.state.selectedUnit == '' ? 'Select Unit'
                                                          : this.state.selectedUnit;

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
                          <Dropdown isOpen={this.state.dropdownOpen} toggle={::this.toggle}>
                            <DropdownToggle caret>
                              {dropdownTitle}
                            </DropdownToggle>
                            <DropdownMenu>
                              {
                                this.state.units.map( (unit, index) => {
                                    return <DropdownItem key={index}
                                              onClick={()=> ::this.onUnitSelected(unit)}>{unit}</DropdownItem>
                                })
                              }
                            </DropdownMenu>
                          </Dropdown>
                        </Row>
                        <Row>
                          <Button color='primary'
                                  className={nextButtonClassName}
                                  onClick={::this.onNext}>Next</Button>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
           </div>
  }

}

export default withRouter(connect()(Units));
