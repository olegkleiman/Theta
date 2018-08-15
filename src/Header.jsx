// flow
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col,
  Nav, Navbar, NavItem, NavbarBrand, NavbarToggler,
  Collapse,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';

import firebaseApp from './firebase.js';

type State = {
  isOpen: Boolean,
  dropdownOpen: Boolean,
}

class Header extends React.Component<{}, State> {

  state = {
      isOpen: false,
      dropdownOpen: false,
  };

  logout = () => {

    firebaseApp.auth().signOut();

    this.props.dispatch({
      type: 'LOGOUT'
    });

    this.props.history.push('');

  }

  dropdownToggle(e){
      this.setState({
          dropdownOpen: !this.state.dropdownOpen
      });
  }

  openSidebar(){
      document.documentElement.classList.toggle('nav-open');
      this.refs.sidebarToggle.classList.toggle('toggled');
  }

  render() {
    return (<Navbar
              expand="lg"
              className='navbar-absolute fixed-top navbar-transparent bg-transparent'>
                <Container fluid>
                  <div className="navbar-wrapper">
                    <div className="navbar-toggle">
                      <button type="button" ref="sidebarToggle" className="navbar-toggler" onClick={() => this.openSidebar()}>
                        <span className="navbar-toggler-bar bar1"></span>
                        <span className="navbar-toggler-bar bar2"></span>
                        <span className="navbar-toggler-bar bar3"></span>
                      </button>
                    </div>
                    <NavbarBrand href="/">{this.props.pageName}</NavbarBrand>
                  </div>
                  <NavbarToggler onClick={this.toggle}>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                  </NavbarToggler>
                  <Collapse isOpen={this.state.isOpen} navbar className="justify-content-end">
                      <Nav navbar>
                          <NavbarBrand className='navbar-item'>ברוכים הבאים {this.props.userName}</NavbarBrand>
                          <Dropdown nav isOpen={this.state.dropdownOpen} toggle={(e) => this.dropdownToggle(e)}>
                              <DropdownToggle caret nav>
                                  <i className="fas fa-user"></i>&nbsp;
                                  <p>
                                    <span>חשבון משתמש</span>
                                  </p>
                              </DropdownToggle>
                              <DropdownMenu right>
                                  <DropdownItem tag="a" onClick={::this.logout}>
                                    <Row>
                                      <Col md='5'>
                                          <img src={this.props.userPictureUrl} className='rounded' width='32px' height='32px' />
                                      </Col>
                                      <Col md='7'>
                                          <div className='navbar-text'>התנתקות</div>
                                      </Col>
                                    </Row>
                                  </DropdownItem>
                              </DropdownMenu>
                          </Dropdown>
                      </Nav>
                  </Collapse>
                </Container>
            </Navbar>)
  }

};

function mapStateToProps(state) {
  return {
      pageName: state.pageName,
  }
}

export default connect(mapStateToProps)(Header);
