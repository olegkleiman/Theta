// @flow
import React from 'react';
import firebase from './firebase.js';
import { Card, CardHeader, CardBody,
  Row, Col,
  Tooltip } from 'reactstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import classNames from 'classnames';
import withAuth from './FirebaseAuth';

type State = {
  unitRoles: String[],
  groupRoles: String[],
  selectedGroup: String,
  selectedUnit: String,
  allowGroupDelete: Boolean,
  groupDeleteTooltipOpen: Boolean,
  allowUnitDelete: Boolean,
  unitDeleteTooltipOpen: Boolean
}

class UserPermissions extends React.Component<{}, State> {

  state = {
    unitRoles: [],
    groupRoles: [],
    selectedGroup: '',
    selectedUnit: '',
    allowGroupDelete: false,
    groupDeleteTooltipOpen: false,
    allowUnitDelete: false,
    unitDeleteTooltipOpen: false
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

  deleteGroupPermissions() {
    console.log('DGP');
  }

  deleteUnitPermissions() {
    console.log('DGP');
  }

  render() {

    const groupDeleteClassNames = classNames({
      'd-none': !this.state.allowGroupDelete,
      'fa': true,
      'fa-trash': true
    });

    const unitDeleteClassNames = classNames({
      'd-none': !this.state.allowUnitDelete,
      'fa': true,
      'fa-trash': true
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
        <CardHeader>
          <h6 className='title'>ניהול הרשאות</h6>
        </CardHeader>
        <CardBody>
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
            <Col md='1' id='groupTooltipContainer' style={{
                lineHeight: '3em'
              }}>
              <i className={groupDeleteClassNames} id='groupDeleteElement'
                onClick={::this.deleteGroupPermissions}></i>
              <Tooltip placement='auto'
                autohide={true}
                isOpen={this.state.allowGroupDelete}
                container='groupTooltipContainer'
                style={{
                  backgroundColor: 'black',
                  color: 'white'
                }}
                target='groupDeleteElement'>
                הורד הרשאות לקבוצה שנבחרה
              </Tooltip>

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
            <Col md='1' id='unitTooltipContainer' style={{
                lineHeight: '3em'
              }}>
              <i className={unitDeleteClassNames} id='unitDeleteElement'
                onClick={::this.deleteUnitPermissions}></i>
              <Tooltip placement='auto'
                autohide={true}
                isOpen={this.state.allowUnitDelete}
                container='unitTooltipContainer'
                style={{
                  backgroundColor: 'black',
                  color: 'white'
                }}
                target='unitDeleteElement'>
                הורד הרשאות למוסד שנבחר
              </Tooltip>
            </Col>
          </Row>
          <br />
        </CardBody>
      </Card>)

  }

};

export default withAuth(UserPermissions);
