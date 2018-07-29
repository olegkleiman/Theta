// @flow
import React from 'react';
import firebase from './firebase.js';
import { Card, Row, Col } from 'reactstrap';
import ReactTable from 'react-table';

type State = {
  users: []
}

class UserList extends React.PureComponent<{}, State> {

  state = {
    users: [],
    sorting: [{ columnName: 'first_name', direction: 'asc' }]
  }

  // constructor(props) {
  //   super(props);
  //
  //   this.state = {
  //   };
  // }

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

    const { users, sorting } = this.state;

    const _columns = [
      { Header: 'שם פרטי', accessor: 'first_name' },
      { Header: 'שם משפחה', accessor: 'last_name' },
      { Header: 'תפקיד', accessor: 'role' },
      { Header: 'אי-מייל', accessor: 'email' }
    ];

    return (
      <div>
        <div className='panel-header panel-header-sm'></div>
        <div className='content'>
          <Card>
            <Row>
              <Col md='12'>
                <ReactTable
                  className="-striped -highlight tableInCard col col-12"
                  data={users}
                  columns={_columns}
                  getTheadThProps = { () => {
                    return {
                      style: {
                        'textAlign': 'right'
                      }
                    }
                  }}
                  loadingText='טוען נתונים...'
                  noDataText='אין נתונים'
                  previousText = 'קודם'
                  nextText = 'הבא'
                  pageText = 'עמוד'
                  ofText = 'מתוך'
                  rowsText = 'שורות'
                  />
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    );

  }

};

export default UserList;
