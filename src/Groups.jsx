import React from 'react';

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

class Groups extends React.Component {

  render() {
    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>Groups</h5>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
         </div>
  }

}

export default Groups;
