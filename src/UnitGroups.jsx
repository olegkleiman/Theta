// @flow
import React from 'react';
import ReactTable from 'react-table';
import moment from 'moment';
import firebase from './firebase.js';

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
  groups: Group[]
}

class UnitGroups extends React.Component<Props, State> {

  state = {
    groups: []
  }

  componentDidUpdate(prevProps: Props, prevState: State) {

    if( prevProps.docId !== this.props.docId) {

      this._loadAsyncData(this.props.docId)
    }

  }

  _loadAsyncData(docId: String) {

    const getOptions = {
      source: 'server'
    }

    let _groups: Group[] = [];

    firebase.firestore().collection('units').doc(this.props.docId).collection('groups')
    .get(getOptions)
    .then( resp => {
      resp.docs.forEach( (group, index) => {

        let data = group.data();

        let closedDate = '';
        if( data.closed ) {
          closedDate = moment.unix(data.closed.seconds).format('DD/MM/YYYY')
        }
        let registeredPupils = ( data.registeredPupils ) ? data.registeredPupils : 0;

        _groups.push({
          name: data.name,
          symbol: data.symbol,
          opened: moment.unix(data.opened.seconds).format('DD/MM/YYYY'),
          closed: closedDate,
          price: data.price + ' NIS',
          capacity: data.capacity,
          registeredPupils: registeredPupils
        });

      });

      this.setState({
        groups: _groups
      });

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

  render() {
    return (
      <ReactTable
        data={this.state.groups}
        noDataText="Loading..."
        filterable
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
         className="-striped -highlight">
     </ReactTable>
   )
  }

}

export default UnitGroups;
