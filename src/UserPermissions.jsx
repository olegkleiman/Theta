// @flow
import React from 'react';
import firebase from './firebase.js';
import { Card, Row, Col } from 'reactstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import withAuth from './FirebaseAuth';

type State = {
  unitRoles: String[],
  groupRoles: String[]
}

class UserPermissions extends React.Component<{}, State> {

  async componentDidMount() {
    try {

      const response = await firebase.firestore().collection('users')
                       .where("email", "==", this.props.userId)
                      .get();
      if( response.docs.length > 0 ) {
         const userData = response.docs[0];
         const secRoles = userData.sec_roles;
         const unitRoles = [];
         const groupRoles = [];

         secRoles.forEach( secRole => {
            if( secRole.includes('group') ) {
              groupRoles.push(secRole);
            } else if( secRole.includes('unit') ) {
              unitRoles.push(secRole);
            }
         })

         this.setState({
           unitRoles: unitRoles,
           groupRoles: groupRoles
         })
      }

    } catch( err ) {
      console.error(err);
    }

  }

  render() {

    return(
      <Card>
        <Row>
          <Col md='6'>
            <label className='form-control-label'>מוסדות</label>
          </Col>
          <Col>
            <label className='form-control-label'>כיתות</label>
          </Col>
        </Row>
        <Row>
          <Col md='6'>
            <DropdownList />
          </Col>
          <Col md='6'>
            <DropdownList />
          </Col>
        </Row>
      </Card>)

  }

};

export default withAuth(UserPermissions);
