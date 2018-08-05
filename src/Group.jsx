// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
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
    capacity: Number,
    open: Date,
    openTill: Date,
    unitName: String,
    price: Number
}

type State = {
  groups: Group[],
  tooltipOpen: Boolean
}

class Groups extends React.Component<{}, State> {

  state = {
    groups: [],
    tooltipOpen: false
  }

  async componentDidMount() {

    const getOptions = {
      source: 'server'
    }

    const _groups = [];
    const units = await firebase.firestore().collection('units')
                       .get(getOptions);

    units.docs.forEach( async(unit) => {

      const unitData = unit.data();
      const unitId = unit.id;
      const unitName = unitData.name_he;

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
            open: moment.unix(groupData.opened.seconds).format('DD/MM/YYYY'),
            openTill: openTill,
            price: groupData.price,
            capacity: groupData.capacity
          });

      });

    });

    this.setState({
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
        pupilData.push(group.id);
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
                  fieldName: String,
                  value) {
  }

  async handleUpdate(cellInfo, e) {
    if( e.key === 'Enter' || e.type === 'blur') {

      e.preventDefault();

      const value = e.target.innerHTML;
      this.updateFirestore(cellInfo.index, cellInfo.column.id, value);
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

  render() {

    const columns = [{
      Header: 'שם',
      accessor: 'name'
    }, {
      Header: 'מזהה',
      accessor: 'symbol'
    }, {
      Header: 'כמות ילדים',
      accessor: 'capacity'
    }, {
      Header: 'שם מוסד',
      accessor: 'unitName'
    }, {
      Header: 'ת. התחלה',
      accessor: 'open'
    }, {
      Header: 'ת.סיום',
      accessor: 'openTill'
    }, {
      Header: 'מחיר',
      accessor: 'price',
      Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.price)
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
                          <Col md='12' className='text-right my-auto' id='tooltipContainer'>
                              <Button color='primary' id='btnExportExcel'
                                      onClick={::this.exportExcel}>Excel</Button>
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
                        </Row>
                        <Row>
                          <Col md='12'>
                            <ReactTable
                          filterable
                          PaginationComponent={Pagination}
                          getTheadThProps = { () => {
                            return {
                              style: {
                                'textAlign': 'right'
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
