// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
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

    const resp = await firebase.firestore().collection('units').doc(this.props.docId).collection('groups')
                       .get(getOptions);

    resp.docs.forEach( (group, index) => {

      let data = group.data();
      const secRole = data.sec_role;
      const isAllowed = userRoles.find( role => {
        return role === secRole
      });

      if( isAllowed ) {

        let _isClosed = data.isClosed;

        let _openedDate= ( data.opened ) ?
                      moment.unix(data.opened.seconds).format('DD/MM/YYYY') :
                      '<none>';

        let _openedTillDate = ( data.openedTill ) ?
                        moment.unix(data.openedTill.seconds).format('DD/MM/YYYY') :
                        '<none>';

        let registeredPupils = ( data.registeredPupils ) ? data.registeredPupils : 0;

        _groups.push({
          id: group.id,
          name: data.name,
          symbol: data.symbol,
          opened: _openedDate,
          openedTill: _openedTillDate,
          isClosed: _isClosed,
          price: data.price + ' NIS',
          capacity: data.capacity,
          registeredPupils: registeredPupils
        });
      }

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
    const groupData = this.state.groups[index];
    groupData.isClosed = !groupData.isClosed;
    this.setState({
      groups: this.state.groups
    })

    let rishumonStatus = ( groupData.isClosed  ) ? "1" : "4"; // Statuses: 1 - Open
                                                              //           4 - Close

    try {
      await firebase.firestore().collection('units')
                      .doc(this.props.docId).collection('groups')
                      .doc(groupData.id)
                      .update({
                        isClosed: groupData.isClosed
                      });

      let headers = new Headers();
      headers.append('Authorization', 'Basic ZWxhbXlhbjExNTplbGFteWFuMTE1');
      headers.append('Content-Type', 'application/json');

      await fetch('https://rishumon.com/api/elamayn/edit_class.php?secret=Day1!', {
        mode: 'no-cors',
        //headers: headers,
        method: 'POST',
        body: JSON.stringify({
        	"groupSymbol": groupData.symbol,
        	"description": groupData.name,
        	"status": rishumonStatus,
        	"price": groupData.price
        })
      })

    } catch( err ) {
      console.log(err);
    }

  }

  onRowSelected = (rowInfo) => {
    if( rowInfo ) {
      this.props.history.push(`/dashboard/group/${this.props.docId}/${rowInfo.original.id}`);
    }
  }

  render() {

    const self = this;

    return (
      <ReactTable
        className="-striped -highlight tableInCard col col-12"
        data={this.state.groups}
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
            onClick: (e, handleOriginal) => {
              if( column.id != 'isClosed' ) {
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
            accessor: 'opened'
          }, {
             Header: 'תאריך סגירה',
             accessor: 'openedTill'
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
        }, ]}
         >
     </ReactTable>
   )
  }

}

export default withRouter(withAuth(UnitGroups));
