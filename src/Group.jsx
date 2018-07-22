// flow
import React from 'react';
import { Button, Row, Col,
         Card, CardBody
} from 'reactstrap';
import ReactTable from 'react-table';
import moment from 'moment';
import firebase from './firebase.js';

class Pupil {
  name: String;
  id: String;
  phoneNumber: String;
  birthDay: String;
  whenRegistered: Timestamp;

  constructor(name: String,
              id: String,
              phoneNumber: String,
              birthDay: String,
              whenRegistered: Timestamp,
              parentId: String,
              address: String) {
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
      response.docs.forEach( (pupil) => {

        const pupilData = pupil.data();
        const _pupil = new Pupil(pupilData.name,
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

  renderEditable(cellInfo) {
    return (<div
              style={{ backgroundColor: "#fafafa" }}
              contentEditable
              onBlur={e => {
                const value = e.target.innerHTML;
                console.log(value);
                if( value ) {
                }
              }}>

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
                    <Col md='12'>
                      <ReactTable
                        className="-striped -highlight tableInCard"
                        data={this.state.pupils}
                        noDataText={this.state.dataStatus}
                        filterable
                        columns={[{
                          Header: 'Name',
                          accessor: 'name'
                        }, {
                          Header: 'ID',
                          accessor: 'id'
                        }, {
                          Header: 'Phone number',
                          accessor: 'phoneNumber'
                        }, {
                          Header: 'Birthday',
                          accessor: 'birthDay'
                        },{
                          Header: 'When Registered',
                          accessor: 'whenRegistered'
                        }, {
                          Header: 'Parent ID',
                          accessor: 'parentId'
                        }, {
                          Header: 'Address',
                          accessor: 'address',
                          Cell: ::this.renderEditable
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
