// @flow
import React from 'react';
import firebase from './firebase.js';
import classNames from 'classnames';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Unit from './Unit';
import Groups from './Groups';
import withAuth from './FirebaseAuth.jsx';

import { Button, Row, Col,
        Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

type State = {
  units: [],
  selectedUnit: {
    name: String,
    id: String
  },
  dropdownOpen: Boolean,
  dataStatus: string
}

class Units extends React.Component<{}, State> {

  state = {
    units: [],
    selectedUnit: {
      name: '',
      id: ''
    },
    dropdownOpen: false,
    dataStatus: 'Loading'
  };

  toggle() {
     this.setState(prevState => ({
       dropdownOpen: !prevState.dropdownOpen
     }));
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {

    if( this.props.secRoles.length != prevProps.secRoles.length ) {
      const userRoles = this.props.secRoles;

      const getOptions = {
        source: 'server'
      }

      const self = this;

      const response = await firebase.firestore().collection('units')
                         .get(getOptions);

      const _units = [];

      response.docs.forEach( (unit) => {

        const unitData = unit.data();

        const secRole = unitData.sec_role;
        const isSecGroupFound = userRoles.find( role => {
          return role === secRole
        });

        if( isSecGroupFound ) {
          _units.push({
            name: unitData.name_he,
            concessionaire: unitData.concessionaire,
            symbol: unitData.symbol,
            id: unit.id
          });
        }

      });



      this.setState({
        units: _units,
        dataStatus: _units.length == 0 ? 'No Units are allowed to view for this account'
                                        : this.state.dataStatus
      })
    }
  }

  onUnitSelected = (unit) => {
    this.setState({
      selectedUnit: unit
    })
  }

  onRowSelected = (rowInfo) => {

    this.setState({
      selectedUnit: {
        name: rowInfo.original.name,
        id: rowInfo.original.id
      }
    });
  }

  render() {

    let nextButtonClassName = classNames('btn btn-next btn-fill btn-success btn-wd', {
      'disabled': this.state.selectedUnit.name == ''
    });

    const dropdownTitle = this.state.selectedUnit.name == '' ? 'Select Unit'
                                                          : this.state.selectedUnit.name;

    let unit = this.state.selectedUnit.id == '' ? null
                : <Unit docId={this.state.selectedUnit.id} />

    const self = this;

    const columns = [{
      Header: 'ID',
      accessor: 'id'
    },{
      Header: 'Name',
      accessor: 'name'
    }, {
      Header: 'Symbol',
      accessor: 'symbol',
    }, {
      Header: 'Concessionaire',
      accessor: 'concessionaire'
    }];

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
                          <div className='card'>
                            <div className='card-body'>
                            <ReactTable
                              getTrProps={(state, rowInfo, column) => {
                                  return {
                                    onClick: (e, handleOriginal) => {
                                      self.onRowSelected(rowInfo);
                                      if( handleOriginal )
                                        handleOriginal();
                                    }
                                  }
                              }}
                              data={this.state.units}
                              noDataText={this.state.dataStatus}
                              columns={columns}
                              minRows={5}
                              showPagination={false}
                              className="-highlight col col-12"/>
                          </div>
                          </div>
                        </Row>
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

export default withAuth(Units);
