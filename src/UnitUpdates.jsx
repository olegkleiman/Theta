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
  SearchState } from '@devexpress/dx-react-grid';
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
    sorting: [{ columnName: 'pupils', direction: 'asc' }]
  }

  componentDidUpdate(prevProps, prevState) {

    if( prevProps.docId !== this.props.docId) {

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
            update_date: moment(data.update_date.seconds*1000).format('DD/MM/YYYY'),
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
  }

  render() {

    const { updates, columns, sorting } = this.state;

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
