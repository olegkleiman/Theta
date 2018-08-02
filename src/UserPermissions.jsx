// @flow
import React from 'react';
import firebase from './firebase.js';
import { Card, Row, Col } from 'reactstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import withAuth from './FirebaseAuth';

type State = {
  unitRoles: String[],
  groupRoles: String[],
  selectedGroup: String,
  selectedUnit: String
}

class UserPermissions extends React.Component<{}, State> {

  state = {
    unitRoles: [],
    groupRoles: [],
    selectedGroup: '',
    selectedUnit: ''
  }

  async componentDidMount() {
    try {

      const response = await firebase.firestore().collection('users')
                       .doc(this.props.userId)
                      .get();
      if( response.exists > 0 ) {
         const userData = response.data();
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

  handleGroupPermissionCreate = (name) => {

    const groupRoles = [...this.state.groupRoles, name];

    this.setState({
      selectedGroup: name,
      groupRoles: groupRoles
    })

  }

  handleUnitPermissionCreate = (name) => {

    const unitRoles = [...this.state.unitRoles, name];

    this.setState({
      selectedUnit: name,
      unitRoles: groupRoles
    })

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
            <DropdownList
                filter
                data={this.state.groupRoles}
                value={this.state.selectedGroup}
                onChange={ name => this.setState({
                  selectedGroup: name
                }) }
                onCreate={ name => ::this.handleGroupPermissionCreate(name) }
                allowCreate="onFilter"/>
          </Col>
          <Col md='6'>
            <DropdownList
                filter
                data={this.state.unitRoles}
                value={this.state.selectedUnit}
                onChange={ name => this.setState({
                  selectedUnit: name
                }) }
                onCreate={ name => ::this.handleUnitPermissionCreate(name) }
                allowCreate="onFilter"/>
          </Col>
        </Row>
      </Card>)

  }

};

export default withAuth(UserPermissions);
