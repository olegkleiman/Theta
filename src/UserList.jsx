import React from 'react';
import { connect } from 'react-redux';
import firebase from './firebase.js';
import { Card } from 'reactstrap';
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


import {
  generateRows,
  defaultColumnValues,
} from './generator';

const editColumnMessages = {
  addCommand: 'משתמש חדש',
  editCommand: 'שנה',
  deleteCommand: 'מחק',
  commitCommand: 'שמירה',
  cancelCommand: 'ביטול',
};

const getRowId = row => row.id;

class UserList extends React.PureComponent {

  constructor(props) {
    super(props);

    let _rows = generateRows({
        columnValues: { id: ({ index }) => index, ...defaultColumnValues },
        length: 8,
      });
    console.log(_rows);

    this.state = {
       columns: [
         { name: 'first_name', title: 'שם פרטי' },
         { name: 'last_name', title: 'שם משפחה' },
         { name: 'role', title: 'תפקיד' },
         { name: 'email', title: 'אי-מייל' },
       ],
       rows: _rows,
       users: [],
       sorting: [{ columnName: 'first_name', direction: 'asc' }]
    };

    this.commitChanges = this.commitChanges.bind(this);
  }

  componentDidMount() {

    firebase.auth().signInAndRetrieveDataWithCustomToken(this.props.accessToken)
                    .catch( error => {
                      var errorCode = error.code;
                      var errorMessage = error.message;
                    });

    firebase.auth().onAuthStateChanged( (user) => {
      if( user ) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
      }
    });

    this.unregisterCollectionObserver = firebase.firestore().collection('users').onSnapshot( (snap) => {

      const _users = [];

      snap.forEach( (docSnapshot) => {
        let _data = docSnapshot.data();

        _users.push({
          id: docSnapshot.id,
          first_name: _data.first_name,
          last_name: _data.last_name,
          email: _data.email,
          role: _data.role
        });

      });

      this.setState({
        users: _users
      })

    });
  }

  componentWillUnmount() {
    if( this.unregisterCollectionObserver ) {
      this.unregisterCollectionObserver();
    }
  }

  commitChanges({ added, changed, deleted }) {
      let { rows } = this.state;
      if (added) {

        added.map((user, index) => (
          firebase.firestore().collection('users').add({
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role,
              email: user.email
          })
          .then( _ => {
            console.log('Document successfully written!');
          })
        ));

      }
      if (changed) {
        let changedIds = Object.keys(changed);
        let docId = changedIds[0];
        const changedDoc = changed[docId];
        firebase.firestore().collection("users").doc(docId).set(
          changedDoc, {
            merge: true
          });
      }
      if (deleted) {

        let docId = deleted[0];
        firebase.firestore().collection("users").doc(docId).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
      }
      this.setState({ rows });
  }

  render() {

    const { users, columns, sorting } = this.state;

    return (
      <Card>
        <Grid
          rows={users}
          columns={columns}
          getRowId={getRowId}
        >
          <PagingState
            defaultCurrentPage={0}
            pageSize={3}
          />
          <SearchState />
          <IntegratedFiltering />
          <IntegratedPaging />
          <EditingState
            onCommitChanges={this.commitChanges}
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
            messages={editColumnMessages}
          />
          <Toolbar />
          <SearchPanel />
          <PagingPanel />
        </Grid>
      </Card>
    );

  }

};

function mapStateToProps(state) {
  return {
    accessToken: state.jwt,
  }
}

export default connect(mapStateToProps)(UserList);
