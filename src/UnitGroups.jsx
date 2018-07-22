// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import moment from 'moment';
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
    dataStatus: 'Loading...'
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

    try {
      await firebase.firestore().collection('units')
                      .doc(this.props.docId).collection('groups')
                      .doc(groupData.id)
                      .update({
                        isClosed: groupData.isClosed
                      });
    } catch( err ) {
      console.log(err);
    }

  }

  onRowSelected = (rowInfo) => {

    this.props.history.push(`/dashboard/group/${this.props.docId}/${rowInfo.original.id}`);
  }

  render() {

    const self = this;

    return (
      <ReactTable
        className="-striped -highlight tableInCard"
        data={this.state.groups}
        noDataText={this.state.dataStatus}
        filterable
        getTdProps= { (state, rowInfo, column, instance) => {
          return {
            onClick: (e, handleOriginal) => {
              if( column.id != 'isClosed' ) {
                self.onRowSelected(rowInfo);
              }
            }
          }
        }}
        getTrProps={(state, rowInfo, column) => {
            return {
              style: {
                cursor: 'pointer'
              }
            }
        }}
        columns={[{
           Header: 'Name',
           accessor: 'name'
         }, {
           Header: 'Symbol',
           accessor: 'symbol'
         }, {
           Header: 'Price',
           accessor: 'price'
         },
         {
            Header: 'Open From',
            accessor: 'opened'
          }, {
             Header: 'Open Till',
             accessor: 'openedTill'
          }, {
           Header: 'Capacity',
           accessor: 'capacity'
         }, {
           Header: 'Pupils Registered',
           accessor: 'registeredPupils',
           Cell: row => {
            const capacity = row.original['capacity'];
            let percentage = 0;
            if( row.value  && row.value > 0 ) {
              percentage = row.value / capacity * 100;
            }
            //percentage += '%';

             return (
               <div style={{
                 width: '100%',
                 height: '100%',
                 backgroundColor: '#dadada',
                 borderRadius: '2px'
               }}>
                 <div style={{
                     width: percentage, //`${row.value}%`,
                     backgroundColor: row.value > 66 ? '#85cc00'
                      : row.value > 33 ? '#ffbf00'
                      : '#ff2e00',
                     height: '100%',
                     borderRadius: '2px',
                     transition: 'all .2s ease-out'
                   }}>
                   32%
                </div>
              </div>)
           }
         }, {
            Header: 'Is Closed',
            accessor: 'isClosed',
            Cell: ::this.renderCheckable
        }, ]}
         >
     </ReactTable>
   )
  }

}

export default withRouter(withAuth(UnitGroups));
