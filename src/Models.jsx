// @flow
import React from 'react';

import {
  Button,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

class Models extends React.Component {

  render() {
    return <div>
              <div className='panel-header panel-header-sm'></div>
              <div className='content container h-100'>
                <Row>
                  <div className='col col-md-12'>
                    <div className='card'>
                      <div className='card-header'>
                        <h5 className='title'>Models</h5>
                      </div>
                      <div className='card-body'>
                        <Row>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Row>
              </div>
           </div>
  }

};

export default Models;
