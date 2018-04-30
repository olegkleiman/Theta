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

const getRowId = row => row.id;

class UserList extends React.PureComponent {

  constructor(props) {
    super(props);

     this.state = {
       columns: [
         { name: 'name', title: 'Name' },
         { name: 'sex', title: 'Sex' },
         { name: 'city', title: 'City' },
         { name: 'car', title: 'Car' },
       ],
       rows: generateRows({
         columnValues: { id: ({ index }) => index, ...defaultColumnValues },
         length: 8,
       }),
       users: {}
   };

    this.commitChanges = this.commitChanges.bind(this);
  }

  componentDidMount() {

    // var provider = new firebase.auth.GoogleAuthProvider();
    // firebase.auth().languageCode = 'he';
    // firebase.auth().signInWithPopup(provider).then(function(result) {
    //       // This gives you a Google Access Token. You can use it to access the Google API.
    //       var token = result.credential.accessToken;
    //       // The signed-in user info.
    //       var user = result.user;
    //       // ...
    //     }).catch(function(error) {
    //       // Handle Errors here.
    //       var errorCode = error.code;
    //       var errorMessage = error.message;
    //       // The email of the user's account used.
    //       var email = error.email;
    //       // The firebase.auth.AuthCredential type that was used.
    //       var credential = error.credential;
    //       // ...
    //     });

    firebase.auth().signInAndRetrieveDataWithCustomToken(this.props.accessToken)
                    .catch( error => {
                      var errorCode = error.code;
                      var errorMessage = error.message;
                    });

    // firebase.auth().signInAnonymously()
    //                 .then( result => {
    //                   console.log(result)
    //                 })
    //                 .catch( error => {
    //                   var errorMessage = error.message;
    //                 });
    firebase.auth().onAuthStateChanged( (user) => {
      if( user ) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
      }
    });

    this.firebaseRef = firebase.database().ref('/users');
    this.firebaseCallback = this.firebaseRef.on('value', (snap) => {
      this.setState({
        users: snap.val()
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

    const { rows, columns } = this.state;

    return (
      <Card>
        <Grid
          rows={rows}
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
