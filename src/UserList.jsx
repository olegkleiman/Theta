import React from 'react';
import { connect } from 'react-redux';
import firebase from './firebase.js';
import { Card } from 'reactstrap';
import { EditingState } from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableEditRow,
  TableEditColumn
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
       users: []
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

    this.firebaseRef = firebase.database().ref('/users');
    this.firebaseCallback = this.firebaseRef.on('value', (snap) => {

      let id = 0;
      let val = snap.val().filter( el => el != undefined );
      const _users = val.map( (user) => {
        return {
          id: id++,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
        }
      });

      console.log(_users);

      this.setState({
        users: _users
      })
    });

    this.unregisterCollectionObserver = firebase.firestore().collection('users').onSnapshot( (snap) => {

      const collection = {};

      snap.forEach( (docSnapshot) => {
        collection[docSnapshot.id] = docSnapshot.data();
      });
    });
  }

  componentWillUnmount() {
    // Unregister the listener on '/users'.
    this.firebaseRef.off('value', this.firebaseCallback);

    if( this.unregisterCollectionObserver ) {
      this.unregisterCollectionObserver();
    }
  }

  commitChanges({ added, changed, deleted }) {
      let { rows } = this.state;
      if (added) {
        const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
        rows = [
          ...rows,
          ...added.map((row, index) => ({
            id: startingAddedId + index,
            ...row,
          })),
        ];
      }
      if (changed) {
        rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
      }
      if (deleted) {
        const deletedSet = new Set(deleted);
        rows = rows.filter(row => !deletedSet.has(row.id));
      }
      this.setState({ rows });
  }

  render() {

    const { users, columns } = this.state;

    return (
      <Card>
        <Grid
          rows={users}
          columns={columns}
          getRowId={getRowId}
        >
          <EditingState
            onCommitChanges={this.commitChanges}
          />
          <Table />
          <TableHeaderRow />
          <TableEditRow />
          <TableEditColumn
            showAddCommand
            showEditCommand
            showDeleteCommand
            messages={editColumnMessages}
          />
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
