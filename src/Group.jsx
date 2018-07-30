// flow
import React from 'react';
import { Button, Row, Col, Input,
         Card, CardBody
} from 'reactstrap';
import ReactTable from 'react-table';
import moment from 'moment';
import XLSX from 'xlsx';
import firebase from './firebase.js';

class Pupil {
  name: String;
  id: String;
  phoneNumber: String;
  birthDay: String;
  whenRegistered: Timestamp;

  constructor(recordId: String,
              name: String,
              id: String,
              phoneNumber: String,
              birthDay: String,
              whenRegistered: Timestamp,
              parentId: String,
              address: String) {
    this.recordId = recordId;
    this.name = name;
    this.id = id;
    this.phoneNumber = phoneNumber;
    this.birthDay = birthDay;

    this.whenRegistered = ( whenRegistered ) ?
                          moment.unix(whenRegistered.seconds).format('DD/MM/YYYY HH:mm') :
                          null;
    this.parentId = parentId;
    this.address = address;
  }
}

class GroupData {
  name: String;
  symbol: String;
  capacity: Number;

  constructor(name: String,
              symbol: String,
              capacity: Number,
              openFrom: Timestamp,
              openTill: Timestamp) {
    this.name = name;
    this.symbol = symbol;
    this.capacity = capacity;
    this.openFrom = moment.unix(openFrom.seconds);
    this.openTill = moment.unix(openTill.seconds);
  }
}

type State = {
  pupils: Array<Pupil>,
  groupData: GroupData,
  dataStatus: String
}

class Group extends React.Component<{}, State> {

  state = {
    pupils: [],
    groupData: {
      name: '',
      symbol: '',
      openFrom: moment(),
      openTill: moment()
    },
    dataStatus: 'טעינת נתונים..'
  }

  async componentDidMount() {
    const groupId = this.props.match.params.groupid;
    const unitId = this.props.match.params.unitid;

    const getOptions = {
      source: 'server'
    }

    const groupDoc = firebase.firestore().collection('units')
                    .doc(unitId).collection('groups')
                    .doc(groupId);

    try {

      const doc = await groupDoc.get(getOptions);
      let data = doc.data();
      const _groupData = new GroupData(data.name,
                                       data.symbol,
                                       data.capacity,
                                       data.opened,
                                       data.openedTill);
      this.setState({
        groupData: _groupData
      })

      const response = await firebase.firestore().collection('units')
                      .doc(unitId).collection('groups')
                      .doc(groupId).collection('pupils')
                      .get(getOptions);

      const _pupils = [];
      response.docs.forEach( (pupilDoc) => {

        const pupilData = pupilDoc.data();
        const _pupil = new Pupil(pupilDoc.id,
                                 pupilData.name,
                                 pupilData.pupilId,
                                 pupilData.phoneNumber,
                                 pupilData.birthDay,
                                 pupilData.whenRegistered,
                                 pupilData.parentId,
                                 pupilData.address);

        _pupils.push(_pupil);
      })

      if( _pupils.length == 0 ) {
        this.setState({
            dataStatus: 'עדיין לא נרשם אף אחד'
        });
      } else {
        this.setState({
          pupils: _pupils
        });
      }

    } catch( err ) {
      console.error(err);
    }

  }

  exportExcel() {

    console.log(this.state.pupils);

    const _data = {
      /* Array of Arrays e.g. [["a","b"],[1,2]] */
     data: [
       [   "שם",    "מזהה", "מספר טלפון" ],
       [    1, "sheetjs",    7262 ],
       [    2, "js-xlsx",    6969 ]
     ],
      /* Array of column objects e.g. { name: "C", K: 2 } */
      cols: [{ name: "A", key: 0 }, { name: "B", key: 1 }, { name: "C", key: 2 }]
    };

    var workbook = XLSX.utils.book_new();
    /* convert from array of arrays to workbook */
    var worksheet = XLSX.utils.aoa_to_sheet(_data.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "SheetJS")
    worksheet = XLSX.utils.json_to_sheet([
  { A:"S", B:"h", C:"e", D:"e", E:"t", F:"J", G:"S" },
  { A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,  G: 7  },
  { A: 2,  B: 3,  C: 4,  D: 5,  E: 6,  F: 7,  G: 8  }
], {header:["A","B","C","D","E","F","G"], skipHeader:true});
    XLSX.utils.book_append_sheet(workbook, worksheet, "SheetJS2")

    /* write a workbook */
    // const wbout = XLSX.write(workbook, {bookType:'xlsx', type:'buffer'});
    // console.log(wbout);
    XLSX.writeFile(workbook, "sheetjs.xlsx");
    // writeFile(file, wbout, 'ascii')
    // .then( (r) => {
    //   console.log(r);
    // })
    // .catch( (e) => {
    //   console.error(err);
    // });
  }

  async handleUpdate(cellInfo, e) {
    if( e.key === 'Enter' || e.type === 'blur') {

      e.preventDefault();

      const value = e.target.innerHTML;

      if( value ) {

        const groupId = this.props.match.params.groupid;
        const unitId = this.props.match.params.unitid;

        const data = [...this.state.pupils];
        data[cellInfo.index][cellInfo.column.id] = value;
        this.setState({
          pupils: data
        });

        const pupilRecordId = data[cellInfo.index].recordId;

        try {

          let json = {};
          const updateField = cellInfo.column.id;
          json[updateField] = value;

          await firebase.firestore().collection('units')
                          .doc(unitId).collection('groups')
                          .doc(groupId).collection('pupils')
                          .doc(pupilRecordId)
                          .update(json);
        } catch( err ) {
            console.error( err );
        }
      }
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
    return (
      <div>
        <div className='panel-header panel-header-sm'></div>
        <div className='content container h-100'>
          <Row>
            <Col className='col-md-12'>
              <Card>
                <div className='card-header'>
                  <h5 className='title' dir='rtl'>רישום תלמידים לכיתה {this.state.groupData.name} (מזהה {this.state.groupData.symbol}) </h5>
                  <h5 className='title'>קיבולת: {this.state.groupData.capacity} ילדים</h5>
                  <h5 className='title'>תאריכי פעילות: מ {this.state.groupData.openFrom.format('DD/MM/YYYY')} עד {this.state.groupData.openTill.format('DD/MM/YYYY')}</h5>
                </div>
                <CardBody>
                  <Row>
                    <Col md='12' className="text-right my-auto">
                      <Button color='primary'
                              onClick={::this.exportExcel}>Excel</Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col md='12'>
                      <ReactTable
                        className="-striped -highlight tableInCard"
                        data={this.state.pupils}
                        noDataText={this.state.dataStatus}
                        filterable
                        getTheadThProps = { () => {
                          return {
                            style: {
                              'textAlign': 'right'
                            }
                          }
                        }}
                        getTdProps = { (state, rowInfo, column, instance) => {
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
                        columns={[{
                          Header: 'שם',
                          accessor: 'name',
                          Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.name)
                        }, {
                          Header: 'מזהה',
                          accessor: 'id'
                        }, {
                          Header: 'מספר טלפון',
                          accessor: 'phoneNumber'
                        }, {
                          Header: 'תאריך לידה',
                          accessor: 'birthDay'
                        },{
                          Header: 'תאריך הרשמה',
                          accessor: 'whenRegistered'
                        }, {
                          Header: 'מזהה הורה',
                          accessor: 'parentId',
                          Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.parentId)
                        }, {
                          Header: 'כתובת',
                          accessor: 'address',
                          Cell: cellInfo => ::this.renderEditable(cellInfo, cellInfo.original.address)
                        }]}>
                      </ReactTable>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default Group;
