// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import { Row, Col, Button } from 'reactstrap';
import moment from 'moment';
import http from 'http';
import firebase from './firebase.js';
import withAuth from './FirebaseAuth';

type Props = {
  docId: String
}

type Group = {
  name: String,
  symbol: String,
  opened: String, // assume already converted from Firebase Timestamp to 'DD/MM/YYYY'
  closed?: String,
  price: String,
  capacity: Number,
  registeredPupils: Number
}

type State = {
  groups: Group[],
  dataStatus: string
}

@withAuth
@withRouter
export default
class UnitGroups extends React.Component<Props, State> {

  state = {
    groups: [],
    dataStatus: 'טוען נתונים...'
  }

  constructor(props) {

    super(props);

    this.styles = {
      isClosed: {
        marginTop: '-16px'
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {

    if( prevProps.docId !== this.props.docId) {

      ::this._loadAsyncData(this.props.docId)
    }

  }

  async _loadAsyncData(docId: String) {

    const userRoles = this.props.secRoles;

    const getOptions = {
      source: 'server'
    }

    let _groups: Group[] = [];

    const resp = await firebase.firestore().collection('units')
                       .doc(this.props.docId).collection('groups')
                       .get(getOptions);

    resp.docs.forEach( (group, index) => {

      let data = group.data();
      // const secRole = data.sec_role;
      // const isAllowed = userRoles.find( role => {
      //   return role === secRole
      // });

      //if( this.props.isAdmin || isAllowed ) {

        let _isClosed = data.isClosed;

        let _openDate= ( data.openFrom ) ?
                      moment.unix(data.openFrom.seconds).format('DD/MM/YYYY') :
                      '<none>';

        let _openTillDate = ( data.openTill ) ?
                        moment.unix(data.openTill.seconds).format('DD/MM/YYYY') :
                        '<none>';

        let registeredPupils = ( data.registeredPupils ) ? data.registeredPupils : 0;

        _groups.push({
          id: group.id,
          name: data.name,
          symbol: data.symbol,
          openFrom: _openDate,
          openTill: _openTillDate,
          isClosed: _isClosed,
          price: data.price + ' ₪',
          capacity: data.capacity,
          registeredPupils: registeredPupils
        });
      //}

    });

    this.setState({
      groups: _groups,
      dataStatus: _groups.length == 0 ? 'No Groups are allowed to view for this account'
                                      : this.state.dataStatus

    });


  }

  renderEditable(cellInfo) {
      return (<div
        style={{ backgroundColor: "#fafafa" }}
        suppressContentEditableWarning
        contentEditable
        onBlur={e => {
                  const value = e.target.innerHTML;
                  if( value ) {
                    const data = [...this.state.groups];
                    data[cellInfo.index][cellInfo.column.id] = value;
                    this.setState({ data });
                  }
                }}>
      </div>);
  }

  renderCheckable(cellInfo) {

    const groupData = this.state.groups[cellInfo.index];
    const _isClosed = groupData.isClosed;

    return (
      <div className='form-check'
        style={this.styles.isClosed}>
        <label className='form-check-label'>
          <input className='form-check-input'
            type='checkbox'
            className='checkbox'
            checked={_isClosed}
            onChange={ () => ::this.toggleIsClosed(cellInfo.index) }
          />
          <span className='form-check-sign'></span>
       </label>
     </div>)
  }

  async toggleIsClosed(index) {

    try {

      const groupData = this.state.groups[index];
      groupData.isClosed = !groupData.isClosed;
      this.setState({
        groups: this.state.groups
      })

      let rishumonStatus = ( groupData.isClosed  ) ? "4" : "1"; // Statuses: 1 - Open
                                                                //           4 - Close

      const data2post = {
        "groupSymbol": groupData.symbol,
        "description": groupData.name,
        "status": rishumonStatus,
        "price": groupData.price
      };

      await fetch('https://rishumon.com/api/elamayn/edit_class.php?secret=Day1%21', {
        // headers: {
        //     "Content-Type": "application/json",
        // },
        mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify(data2post)
      })

      await firebase.firestore().collection('units')
                      .doc(this.props.docId).collection('groups')
                      .doc(groupData.id)
                      .update({
                        isClosed: groupData.isClosed
                      });

    } catch( err ) {
      console.error(err);
    }

  }

  onRowSelected = (rowInfo) => {
    if( rowInfo ) {
      this.props.history.push(`/dashboard/group/${this.props.docId}/${rowInfo.original.id}`);
    }
  }

  editGroup(groupId: String) {
    console.log(`UnitId: ${this.props.docId}. GroupId: ${groupId}`);
  }

  deleteGroup(groupId: String) {
    console.log(`UnitId: ${this.props.docId}. GroupId: ${groupId}`);
  }

  render() {

    const self = this;

    return (
      <ReactTable
        className="-striped -highlight tableInCard col col-12"
        data={this.state.groups}
        noDataText={this.state.dataStatus}
        filterable
        defaultPageSize={5}
        getTheadThProps = { () => {
          return {
            style: {
              'textAlign': 'right',
              'fontWeight': '700'
            }
          }
        }}
        getTdProps = { (state, rowInfo, column, instance) => {
          return {
            onClick: (e, handleOriginal) => {
              if( column.id != 'isClosed'
                  && column.id != 'editors') {
                self.onRowSelected(rowInfo);
              }
            },
            style: {
              'textAlign': 'right'
            }
          }
        }}
        getTrProps={(state, rowInfo, column) => {
            return {
              style: {
                cursor: 'pointer',
                'textAlign': 'left'
              }
            }
        }}
        columns={[{
           Header: 'שם',
           accessor: 'name'
         }, {
           Header: 'סמל',
           accessor: 'symbol'
         }, {
           Header: 'מחיר',
           accessor: 'price'
         }, {
            Header: 'תאריך פתיחה',
            accessor: 'openFrom'
          }, {
             Header: 'תאריך סגירה',
             accessor: 'openTill'
          }, {
           Header: 'כמות מקומות',
           accessor: 'capacity'
          }, {
           Header: 'תלמידים רשומים',
           accessor: 'registeredPupils',
           Cell: row => {

              const capacity = row.original.capacity;
              let percentage = 0;
              if( row.original.registeredPupils && row.original.registeredPupils > 0 ) {
                percentage = Math.round(row.value / capacity * 100);
              }

             return (
               <div style={{
                 width: '100%',
                 height: '100%',
                 backgroundColor: '#dadada',
                 borderRadius: '2px'
               }}>
                 <div style={{
                     width: percentage,
                     backgroundColor: percentage > 66 ? '#85cc00'
                      : percentage > 33 ? '#ffbf00'
                      : 'green',
                     height: '100%',
                     borderRadius: '2px',
                     transition: 'all .2s ease-out'
                   }}>
                   {percentage}%
                 </div>
               </div>)
           }
         }, {
            Header: 'כיתה סגורה',
            accessor: 'isClosed',
            Cell: ::this.renderCheckable
        }, {
          Header: '',
          accessor: 'editors',
          width: 80,
          Cell: row => {
            const groupId = row.original.id;
            return <Row>
                      <Col md='1'>
                        <Button className='btn-round btn-icon btn btn-warning btn-sm'
                                onClick={ () => ::this.editGroup(groupId) } >
                          <i className='fa fa-edit'></i>
                        </Button>
                    </Col>
                    <Col md='1'>
                      <Button className='btn-round btn-icon btn btn-danger btn-sm'
                              onClick={ () => ::this.deleteGroup(groupId) } >
                        <i className='fa fa-times'></i>
                      </Button>
                    </Col>
                 </Row>
          }
        } ]}
        loadingText = 'טוען נתונים...'
        noDataText = 'אין נתונים'
        previousText = 'קודם'
        nextText = 'הבא'
        pageText = 'עמוד'
        ofText = 'מתוך'
        rowsText = 'שורות'
        >
     </ReactTable>
   )
  }

}
