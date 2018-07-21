// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import moment from 'moment';
import firebase from './firebase.js';
import withAuth from './FirebaseAuth.jsx';

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

  async componentDidMount() {
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

        let _closedDate = ( data.closed ) ?
                          moment.unix(data.closed.seconds).format('DD/MM/YYYY') :
                          '<none>';

        let _openedDate= ( data.opened ) ?
                      moment.unix(data.opened.seconds).format('DD/MM/YYYY') :
                      '<none>';

        let registeredPupils = ( data.registeredPupils ) ? data.registeredPupils : 0;

        _groups.push({
          id: group.id,
          name: data.name,
          symbol: data.symbol,
          opened: _openedDate,
          closed: _closedDate,
          price: data.price + ' NIS',
          capacity: data.capacity,
          registeredPupils: registeredPupils
        });
      }

    });

    _groups

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
        getTrProps={(state, rowInfo, column) => {
            return {
              onClick: (e, handleOriginal) => {
                self.onRowSelected(rowInfo);
                if( handleOriginal )
                  handleOriginal();
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
           Header: 'Opened From',
           accessor: 'opened'
         }, {
           Header: 'Closed At',
           accessor: 'closed',
           Cell: ::this.renderEditable
         }, {
           Header: 'Price',
           accessor: 'price'
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
         }]}
         >
     </ReactTable>
   )
  }

}

export default withRouter(withAuth(UnitGroups));
