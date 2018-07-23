// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import moment from 'moment';
import firebase from './firebase.js';

import {
  Container,
  Button,
  Row,
  Card,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormText,
  FormControl,
  FormGroup,
  Label
} from 'reactstrap';

type State = {
  groups: [{
    symbol: String,
    opened: Date
  }],
}

type Props = {

}

class Groups extends React.Component<Props, State> {

  state = {
    groups: []
  }

  componentDidMount() {

    const unitId = this.props.match.params.unitid;

    const getOptions = {
      source: 'server'
    }

    const self = this;

    firebase.firestore().collection('units/' + unitId + '/groups')
      .get(getOptions)
      .then( response => {

        const _groups = [];

        response.docs.forEach( (group) => {
          const groupData = group.data();
          _groups.push({
            symbol: groupData.symbol,
            opened: moment.unix(groupData.opened.seconds).format('DD/MM/YYYY')
          });
        });

        self.setState({
          groups: _groups
        })
      });
  }

  onRowSelected = (rowInfo) => {
    console.log(rowInfo);
  }

  render() {

    const columns = [{
      Header: 'Symbol',
      accessor: 'symbol'
    }, {
      Header: 'Opened',
      accessor: 'opened'
    }];

    const self = this;

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>Groups</h5>
                      </div>
                      <div>
                        <ReactTable
                          getTrProps={(state, rowInfo, column) => {
                              return {
                                onClick: (e, handleOriginal) => {
                                  self.onRowSelected(rowInfo);
                                  if( handleOriginal )
                                    handleOriginal();
                                }
                              }
                          }}
                          data={this.state.groups}
                          noDataText="טוען נתונים..."
                          columns={columns}/>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
         </div>
  }

}

export default withRouter(Groups)
