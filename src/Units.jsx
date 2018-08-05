// @flow
import React from 'react';
import firebase from './firebase.js';
import classNames from 'classnames';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Unit from './Unit';
import Groups from './Groups';
import Pagination from './TablePagination';
import withAuth from './FirebaseAuth';

import { Button, Card, CardBody, Row, Col } from 'reactstrap';

type State = {
  units: [],
  selectedUnit: {
    name: String,
    id: String
  },
  selectedRowIndex: Number,
  dropdownOpen: boolean,
  dataStatus: string
}

@withAuth
export default
class Units extends React.Component<{}, State> {

  state = {
    units: [],
    selectedUnit: {
      name: '',
      id: ''
    },
    selectedRowIndex: -1,
    dropdownOpen: false,
    dataStatus: 'טוען נתונים...'
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
            education_type: unitData.education_type,
            authority: unitData.authority,
            type: unitData.type,
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
      },
      selectedRowIndex: rowInfo.index
    });
  }

  addUnit() {
    this.props.history.push('/dashboard/addunit/');
  }


  render() {

    let unit = this.state.selectedUnit.id == '' ? null
                : <Unit docId={this.state.selectedUnit.id} />

    const self = this;

    const columns = [{
      Header: '',
      expander: true,
      width: 65,
      Expander: ({ isExpanded, ...rest}) =>
        <div style={{
            lineHeight: '34px'
          }}>
          { isExpanded ?
            <span className='expanderIcon'>&#x2299;</span> :
            <span className='expanderIcon'>&#x2295;</span>
          }
        </div>,
      style: {
        cursor: 'pointer',
        fontSize: 25,
        padding: 0,
        userSelect: 'none',
        textAlign: 'center'
      }
    }, {
      Header: 'שם',
      accessor: 'name'
    }, {
      Header: 'סמל',
      accessor: 'symbol',
    }, {
      Header: 'רשות',
      accessor: 'authority'
    }, {
      Header: 'סוג מוסד',
      accessor: 'type'
    }, {
      Header: 'סוג חינוך',
      accessor: 'education_type'
    }];

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>רשימת המוסדות</h5>
                      </div>
                      <div className='card-body'>
                        <Row>
                          <Col md='12' className='d-flex justify-content-end'>
                            <Button color='primary'
                                    className='align-self-end'
                                    onClick={::this.addUnit}>הוסף מוסד +</Button>
                          </Col>
                          <Col md='12'>
                            <Card>
                              <CardBody>
                                <ReactTable
                                  PaginationComponent={Pagination}
                                  filterable
                                  data={this.state.units}
                                  columns={columns}
                                  showPagination={true}
                                  className="-striped -highlight"
                                  loadingText='טוען נתונים...'
                                  noDataText='טוען נתונים...'
                                  previousText = 'קודם'
                                  nextText = 'הבא'
                                  pageText = 'עמוד'
                                  ofText = 'מתוך'
                                  rowsText = 'שורות'
                                  getTheadThProps = { () => {
                                    return {
                                      style: {
                                        'textAlign': 'right'
                                      }
                                    }
                                  }}
                                  SubComponent={ row => {
                                    return (
                                      <div style={{ padding: "20px" }}>
                                          <br />
                                          <Unit docId={row.original.id} />
                                      </div>
                                    )
                                  }}>
                                </ReactTable>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs='12'>
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
