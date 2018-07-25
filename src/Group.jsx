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

// type GroupDate = {
//   name: string,
//   symbol: string
// };

class GroupData {
  name: String;
  symbol: String;
  capacity: Number;

  constructor(name: String,
              symbol: String,
              capacity: Number) {
    this.name = name;
    this.symbol = symbol;
    this.capacity = capacity;
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
      symbol: ''
    },
    dataStatus: 'Loading...'
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
                                       data.capacity);
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
            dataStatus: 'No pupils were registered yet'
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

    const _data = {
      cols: [{ name: "A", key: 0 }, { name: "B", key: 1 }, { name: "C", key: 2 }],
      data: [
        [ "id",    "name", "value" ],
        [    1, "sheetjs",    7262 ],
        [    2, "js-xlsx",    6969 ]
      ]
    };

    console.log(_data);

    /* convert from array of arrays to workbook */
    var worksheet = XLSX.utils.aoa_to_sheet(_data);
    var new_workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS")

    /* write a workbook */
    const wbout = XLSX.write(new_workbookb, {type:'binary', bookType:"xlsx"});
    writeFile(file, wbout, 'ascii')
    .then( (r) => {
      console.log(r);
    })
    .catch( (e) => {
      console.error(err);
    });
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
                  <h5 className='title' dir='rtl'>{this.state.groupData.name}({this.state.groupData.symbol})</h5>
                  <h6>Capacity: {this.state.groupData.capacity} pupils</h6>
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
