// @flow
import React from 'react';
import firebase from './firebase.js';
import { Card } from 'reactstrap';
import ReactTable from 'react-table';

class UserList extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
       columns: [
         { name: 'first_name', title: 'שם פרטי' },
         { name: 'last_name', title: 'שם משפחה' },
         { name: 'role', title: 'תפקיד' },
         { name: 'email', title: 'אי-מייל' },
       ],
       //rows: _rows,
       users: [],
       sorting: [{ columnName: 'first_name', direction: 'asc' }]
    };
  }

  componentDidMount() {

    this.unregisterCollectionObserver = firebase.firestore().collection('users').onSnapshot( (snap) => {

      const _users = [];

      snap.forEach( (docSnapshot) => {
        const _data = docSnapshot.data();

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

    const _columns = [
      { name: 'first_name', accessor: 'שם פרטי' },
      { name: 'last_name', accessor: 'שם משפחה' },
      { name: 'role', accessor: 'תפקיד' },
      { name: 'email', accessor: 'אי-מייל' }
    ];

    return (
      <div>
        <div className='panel-header panel-header-sm'></div>
        <div className='content'>
          <Card>
            <ReactTable
              data={users}
              columns={_columns}
              />
          </Card>
        </div>
      </div>
    );

  }

};

export default UserList;
