// @flow
import React from 'react';
import moment from 'moment';
import firebase from './firebase.js';
import {
  EditingState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  SearchState,
  DataTypeProvider } from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableHeaderRow,
  TableEditRow,
  TableEditColumn,
  PagingPanel
} from '@devexpress/dx-react-grid-bootstrap4';

type State = {
  columns: [],
  updates: [],
  sorting: []
}

type Props = {
  docId: String
}

const getRowId = row => row.id;

const DateFormatter = ({ value }) => {
  return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3.$2.$1');
}

const DateTypeProvider = props => (
  <DataTypeProvider
    formatterComponent={DateFormatter}
    {...props}
  />
);

class UnitUpdates extends React.Component<Props, State> {

  state = {
    columns: [
      { name: 'update_date', title: 'update date' },
      { name: 'pupils', title: 'students' },
      { name: 'pupils_special', title: 'special students'},
      { name: 'places', title: 'places' }
    ],
    //rows: _rows,
    updates: [],
    sorting: [{ columnName: 'pupils', direction: 'asc' }],
    dateColumns: ['update_date']
  }

  componentDidUpdate(prevProps, prevState) {

    if( prevProps.docId !== this.props.docId) {

      this._loadAsyncData(this.props.docId)
    }

  }

  _loadAsyncData(docId: String) {

    const getOptions = {
      source: 'server'
    }

    let _updates = [];

    firebase.firestore().collection('units').doc(this.props.docId).collection('updates')
    .get(getOptions)
    .then( resp => {

      resp.docs.forEach( (update, index) => {

        let data = update.data();

        _updates.push({
          id: update.id,
          update_date: moment(data.update_date.seconds*1000).format('DD-MM-YYYY'),
          places: data.places,
          pupils: data.pupils,
          pupils_special: data.pupils_special
        })
      });

      this.setState({
        updates: _updates
      });

    });
  }

  commitChanges({ added, changed, deleted }) {

    let { updates } = this.state;
    if (added) {

      added.map( (update, index) => {

        firebase.firestore().collection("units").doc(this.props.docId)
        .collection('updates').add({
          places: update.places,
          pupils: update.pupils,
          pupils_special: update.pupils_special,
          update_date: new Date() // TBD
        });
      })

    }
    if (changed) {

      let changedIds = Object.keys(changed);
      let docId = changedIds[0];
      const changedDoc = changed[docId];

      if( changedDoc.hasOwnProperty('update_date') ) {
        const _updateDate = moment(changedDoc.update_date);
        changedDoc.update_date = {
          seconds: _updateDate.format('X'),
          nanoseconds: 0
        }
      }

      firebase.firestore().collection("units").doc(this.props.docId)
        .collection('updates').doc(docId).set(
        changedDoc, {
          merge: true
        }
      );

    }
    if (deleted) {

      let docId = deleted[0];
      firebase.firestore().collection("units").doc(this.props.docId)
        .collection('updates').doc(docId).delete().then(function() {
          console.log("Document successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing document: ", error);
      });

    }

    ::this._loadAsyncData(this.props.docId);

  }

  render() {

    const { updates, columns, sorting, dateColumns } = this.state;

    return (
      <Grid
        rows={updates}
        columns={columns}
        getRowId={getRowId}>
        <PagingState
          defaultCurrentPage={0}
          pageSize={3}
        />
        <IntegratedFiltering />
        <IntegratedPaging />
        <EditingState
          onCommitChanges={::this.commitChanges}
        />

        <SortingState
          sorting={sorting} />

        <DateTypeProvider
          for={dateColumns}
        />

        <Table />
        <TableHeaderRow showSortingControls />
        <TableEditRow />
        <TableEditColumn
          showAddCommand
          showEditCommand
          showDeleteCommand
        />

        <Toolbar />
      </Grid>
    )
  }

}

export default UnitUpdates;
