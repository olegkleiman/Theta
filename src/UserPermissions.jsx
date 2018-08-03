// @flow
import React from 'react';
import firebase from './firebase.js';
import { Card, Row, Col } from 'reactstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import classNames from 'classnames';
import withAuth from './FirebaseAuth';

type State = {
  unitRoles: String[],
  groupRoles: String[],
  selectedGroup: String,
  selectedUnit: String,
  allowGroupDelete: Boolean,
  allowUnitDelete: Boolean
}

class UserPermissions extends React.Component<{}, State> {

  state = {
    unitRoles: [],
    groupRoles: [],
    selectedGroup: '',
    selectedUnit: '',
    allowGroupDelete: false,
    allowUnitDelete: false
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

    const groupDeleteClassNames = classNames({
      'd-none': !this.state.allowGroupDelete,
      'now-ui-icons': true,
      'ui-1_simple-remove': true
    });

    const unitDeleteClassNames = classNames({
      'd-none': !this.state.allowUnitDelete,
      'now-ui-icons': true,
      'ui-1_simple-remove': true
    });

    let ListGroups = ({ item }) => (
      <span>
        <strong>{item.substr(6, item.length)}</strong>
      </span>
    );

    let filterGroupName = (item, value) => {
      const groupSymbol = item.substr(6, item.length);
      return groupSymbol.indexOf(value) === 0;
    }

    return(
      <Card>
        <div className='card-header'>
          <h5 className='title'>ניהול הרשאות</h5>
        </div>

        <Row>
          <Col md='6'>
            <label className='form-control-label'>כיתות</label>
          </Col>
          <Col md='6'>
            <label className='form-control-label'>מוסדות</label>
          </Col>
        </Row>
        <Row>
          <Col md='5'>
            <DropdownList
                filter={filterGroupName}
                itemComponent={ListGroups}
                data={this.state.groupRoles}
                value={this.state.selectedGroup}
                onChange={ name => this.setState({
                  selectedGroup: name,
                  allowGroupDelete: !this.state.allowGroupDelete
                }) }
                onCreate={ name => ::this.handleGroupPermissionCreate(name) }
                allowCreate="onFilter"/>
          </Col>
          <Col md='1' style={{
              lineHeight: '3em'
            }}>
            <i className={groupDeleteClassNames}></i>
          </Col>
          <Col md='5'>
            <DropdownList
                filter
                data={this.state.unitRoles}
                value={this.state.selectedUnit}
                onChange={ name => this.setState({
                  selectedUnit: name,
                  allowUnitDelete: !this.state.allowUnitDelete
                }) }
                onCreate={ name => ::this.handleUnitPermissionCreate(name) }
                allowCreate="onFilter"/>
          </Col>
          <Col md='1' style={{
              lineHeight: '3em'
            }}>
            <i className={unitDeleteClassNames}></i>
          </Col>
        </Row>
      </Card>)

  }

};

export default withAuth(UserPermissions);
