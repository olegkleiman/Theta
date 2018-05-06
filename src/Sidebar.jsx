import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'reactstrap';

class Sidebar extends React.Component {

  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
      return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
  }


  render() {
    return <div className="sidebar" data-color="blue">
              <div className="logo">
                <a href='#' className="simple-text logo-mini">
                      <div className="logo-img">
                          <img src='./img/logo-white.svg' alt="react-logo" />
                      </div>
                </a>
                <a href='#' className="simple-text logo-normal">
                  Theta
                </a>
              </div>
              <div className="sidebar-wrapper" ref="sidebar">
                <Nav>
                    {
                      this.props.routes.map( (prop, index) => {
                        if(prop.redirect)
                            return null;

                        return (
                          <li className={::this.activeRoute(prop.path) + (prop.pro ? " active active-pro":"")} key={index}>

                            <NavLink to={prop.path} className="nav-link" activeClassName="active">
                              <i className={"now-ui-icons "+prop.icon}></i>
                              <p>{prop.name}</p>
                            </NavLink>

                          </li>
                        )
                      })
                    }
                </Nav>
              </div>
           </div>
  }

}

export default Sidebar;
