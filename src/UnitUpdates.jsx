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

      firebase.firestore().collection('units').doc(this.props.docId)
      .get(getOptions)
      .then( doc => {

        let data = doc.data();
        data.updates.forEach( (update, index) => {

          _updates.push({
            id: index,
            update_date: moment(update.update_date.seconds*1000).format('MM/DD/YYYY'),
            places: update.places,
            pupils: update.pupils,
            pupils_special: update.pupils_special
          })
        });

        this.setState({
          updates: _updates
        });

      });

    }

  }

  commitChanges({ added, changed, deleted }) {
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
