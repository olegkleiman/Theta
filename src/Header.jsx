import React from 'react';
import {
  Container,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav
} from 'reactstrap';

import firebaseApp from './firebase.js';

class Header extends React.Component {

  constructor() {

    super();

    this.state = {
        isOpen: false,
        dropdownOpen: false,
    };

  }

  logout = () => {

    firebaseApp.auth().signOut();

    this.props.dispatch({
      type: 'LOGOUT'
    });

    this.props.history.push('');

  }

  openSidebar(){
      document.documentElement.classList.toggle('nav-open');
      this.refs.sidebarToggle.classList.toggle('toggled');
  }

  render() {
    return (<Navbar
              color="white" expand="lg"
              className='navbar-absolute fixed-top'>
                <Container fluid>
                  <div className="navbar-wrapper">
                    <div className="navbar-toggle">
                      <button type="button" ref="sidebarToggle" className="navbar-toggler" onClick={() => this.openSidebar()}>
                        <span className="navbar-toggler-bar bar1"></span>
                        <span className="navbar-toggler-bar bar2"></span>
                        <span className="navbar-toggler-bar bar3"></span>
                      </button>
                    </div>
                    <NavbarBrand href="/">Home</NavbarBrand>
                  </div>
                  <NavbarToggler onClick={this.toggle}>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                  </NavbarToggler>
                  <Collapse isOpen={this.state.isOpen} navbar className="justify-content-end">
                    <Nav navbar>
                      <img src={this.props.userPictureUrl} className='rounded' width='32px' height='32px' />
                      <div>{this.props.userName}</div>
                    </Nav>
                  </Collapse>
                  <button type='button' onClick={::this.logout}>Logout
                  </button>
                </Container>
            </Navbar>)
  }

};

export default Header;
