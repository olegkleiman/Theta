// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import DropdownList from 'react-widgets/lib/DropdownList';
import Datetime from 'react-datetime';
import moment from 'moment';
import XLSX from 'xlsx';
import firebase from './firebase.js';
import Pagination from './TablePagination';
import { Container, Button,
  Row, Col, Card, CardHeader, CardBody,
  Tooltip
} from 'reactstrap';

type Group = {
    id: String,
    unitId: String,
    name: String,
    symbol: String,
    authority: String,
    capacity: Number,
    opened: Date,
    openedTill: Date,
    unitName: String,
    price: Number
}

type State = {
  groups: Group[],
  authorities: String[],
  authoritiesLoaded: Boolean,
  selectedAuthority: String,
  tooltipOpen: Boolean
}

class Groups extends React.Component<{}, State> {

  state = {
    groups: [],
    authorities: [],
    authoritiesLoaded: false,
    selectedAuthority: '',
    tooltipOpen: false
  }

  async componentDidMount() {

    const getOptions = {
      source: 'server'
    }

    let _authorities = [];
    let _authoritiesLoaded = false;

    // try {
    //   const authorities = await firebase.firestore().collection('authorities')
    //                          .get();
    //   const authoritiesDocs = authorities.docs;
    //   _authorities = authoritiesDocs.map( doc => {
    //     const docData = doc.data();
    //     return {
    //       name: docData.name,
    //       region: docData.region
    //     }
    //   });
    //   _authoritiesLoaded = true;
    //
    // } catch( err ) {
    //   console.error(err);
    // }

    const _groups = [];
    try {
      const units = await firebase.firestore().collection('units')
                         .get(getOptions);

      units.docs.forEach( async(unit) => {

        const unitData = unit.data();
        const unitId = unit.id;
        const unitName = unitData.name_he;
        const authority = unitData.authority;

        const groups = await firebase.firestore().collection('units')
                      .doc(unit.id).collection('groups')
                      .get(getOptions);
        groups.docs.forEach( group => {

            const groupData = group.data();
            const groupId = group.id;

            const openTill = groupData.openedTill ?
                             moment.unix(groupData.openedTill.seconds).format('DD/MM/YYYY') :
                             '';

            _groups.push({
              id: groupId,
              unitId: unitId,
              name: groupData.name,
              symbol: groupData.symbol,
              unitName: unitName,
              authority: authority,
              opened: moment.unix(groupData.opened.seconds).format('DD/MM/YYYY'),
              openedTill: openTill,
              price: groupData.price,
              capacity: groupData.capacity
            });

        });

      });
    } catch( err )  {
      console.error(err);
    }

    this.setState({
      authorities: _authorities,
      groups: _groups
    })

  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  }

  exportExcel() {

    const _export = {
      /* Array of Arrays e.g. [["a","b"],[1,2]] */
     data: [
       ["", "מחיר", "ת.סיום", "ת. התחלה", "שם מוסד", "כמות ילדים", "מזהה", "שם"],
     ],
    };

    this.state.groups.forEach( (group, index) => {
        const groupData = [];
        groupData.push(1 + index); // reserve 1 for caption row
        groupData.push(group.name);
        groupData.push(group.symbol);
        groupData.push(group.capacity);
        groupData.push(group.unitName);
        groupData.push(group.open);
        groupData.push(group.openTill);
        groupData.push(group.price);

        _export.data.push(groupData);
    });

    /* create a new blank workbook */
    var workbook = XLSX.utils.book_new();
    console.log(workbook.Views);
    /* convert from array of arrays to workbook */
    var worksheet = XLSX.utils.aoa_to_sheet(_export.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'כיתות');

    /* create view to RTL */
    if(!workbook.Workbook) workbook.Workbook = {};
    if(!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if(!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;

    /* write a workbook */
    XLSX.writeFile(workbook, 'groups.xlsx');

  }

  async updateFirestore(groupIndex: Number,
                        groupId: String,
                        unitId: String,
                        fieldName: String,
                        value) {

     const data = [...this.state.groups];
     data[groupIndex][fieldName] = value;
     this.setState({
       groups: data
     });

     try {
        let json = {};
        const updateField = fieldName;
        json[updateField] = value;

        await firebase.firestore().collection('units')
                        .doc(unitId).collection('groups')
                        .doc(groupId)
                        .update(json);
     } catch( err ) {
       console.error(err);
     }

  }

  async handleUpdate(cellInfo, e) {
    if( e.key === 'Enter' || e.type === 'blur') {

      e.preventDefault();

      const value = e.target.innerHTML;
      this.updateFirestore(cellInfo.index,
                           cellInfo.original.id,
                           cellInfo.original.unitId,
                           cellInfo.column.id,
                           value);
    }
  }

  renderEditable(cellInfo, value) {
    return (
      <div
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={ e => ::this.handleUpdate(cellInfo, e) }
        onBlur={ e => ::this.handleUpdate(cellInfo, e) }>
        {value}
      </div>)
  }

  openDateChaned(_date: Date,
                 cellInfo) {

    this.updateFirestore(cellInfo.index,
                         cellInfo.original.id,
                         cellInfo.original.unitId,
                         cellInfo.column.id,
                         _date.toDate());

  }

  renderDatePicker(cellInfo, value) {
    return(
        <Datetime closeOnSelect={true}
                  value={value}
                  onChange={ (_date) => ::this.openDateChaned(_date, cellInfo) }
                  input={true}
                  timeFormat={false}
                  local='he' />
    );
  }

  onAuthorityChanged = (authority) => {
    this.setState({
      selectedAuthority: authority.name
    });
  }

  render() {

    const columns = [{
      Header: 'שם כיתה',
      accessor: 'name',
      Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.name),
      style: {
        lineHeight: '3em'
      }
    }, {
      Header: 'מזהה',
      accessor: 'symbol',
      Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.symbol),
      style: {
        lineHeight: '3em'
      }
    }, {
      Header: 'כמות ילדים',
      accessor: 'capacity',
      Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.capacity),
      width: 80,
      style: {
        lineHeight: '3em'
      }

    }, {
      Header: 'שם מוסד',
      accessor: 'unitName',
      style: {
        lineHeight: '3em'
      }
    }, {
      Header: 'ת. התחלה',
      accessor: 'opened',
      Cell: cellInfo => ::this.renderDatePicker(cellInfo, cellInfo.original.opened),
      style: {
        overflow: 'visible'
      }
    }, {
      Header: 'ת.סיום',
      accessor: 'openedTill',
      Cell: cellInfo => ::this.renderDatePicker(cellInfo, cellInfo.original.openedTill),
      style: {
        overflow: 'visible'
      }
    }, {
      Header: 'מחיר',
      accessor: 'price',
      Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.price),
      width: 80,
      style: {
        lineHeight: '3em'
      }
    }];

    const self = this;

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <Container className='content h-100'>
                <Row>
                  <Col md='12'>
                    <Card>
                      <CardHeader>
                        <h5 className='title'>ניהול כיתות</h5>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md='2'>
                            <div>סנן לפי רשות</div>
                          </Col>
                          <Col md='2'>
                            <DropdownList filter
                              busy={!this.state.authoritiesLoaded}
                              textField='name'
                              groupBy='region'
                              data={this.state.authorities}
                              onChange={ value => ::this.onAuthorityChanged(value) }
                              />
                          </Col>
                          <Col md={{ size: 2, offset: 4 }}
                              className='text-right my-auto' id='tooltipContainer'>
                              <Button color='primary' id='btnExportExcel'
                                      onClick={::this.exportExcel}>
                                      Excel&nbsp;<i className="far fa-file-excel"></i>
                              </Button>

                              <Tooltip placement='auto'
                                autohide={false}
                                isOpen={this.state.tooltipOpen}
                                toggle={::this.toggle}
                                container='tooltipContainer'
                                style={{
                                  backgroundColor: 'black',
                                  color: 'white'
                                }}
                                target='btnExportExcel'>
                                  ייצוא לקובץ חיצוני
                              </Tooltip>
                          </Col>
                          <Col md='2' className='text-right my-auto' >
                            <Button color='primary'>
                              הוסף כיתה <i className="far fa-plus-square"></i>
                            </Button>
                          </Col>
                        </Row>
                        <Row>
                          <Col md='12'>
                            <ReactTable
                              filterable
                              PaginationComponent={Pagination}
                              getTheadThProps = { () => {
                                return {
                                  style: {
                                    'textAlign': 'right',
                                    'fontWeight': '700'
                                  }
                                }
                              }}
                              loadingText='טוען נתונים...'
                              noDataText='טוען נתונים...'
                              previousText = 'קודם'
                              nextText = 'הבא'
                              pageText = 'עמוד'
                              ofText = 'מתוך'
                              rowsText = 'שורות'
                              data={this.state.groups}
                              columns={columns}/>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Container>
         </div>
  }

}

export default withRouter(Groups)
