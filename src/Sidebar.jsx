// @flow
import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { Nav } from 'reactstrap';

import logo from './logo-white.svg';

type State = {
  currentLink: number
};

class Sidebar extends React.Component<{}, State> {

  state = {
    currentLink: 1
  }

  constructor(props) {
    super(props);
  }

  linkClicked = (linkNumber: number, pageName: String) => {
    console.log(linkNumber);

    this.setState({
      currentLink: linkNumber
    });

    this.props.dispatch({
      type: 'PAGE_NAVIGATED',
      data: {
        pageName: pageName,
      }
    });
  }

  render() {
    return <div className="sidebar" data-color="blue">
              <div className="logo">
                <a href='#' className="simple-text logo-mini">
                      <div className="logo-img">
                          <img src={logo} alt="react-logo" />
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

                        let linkClassName = classNames('menu-item', {
                          'active': prop.id == this.state.currentLink
                        })

                        return (
                          <li className={ linkClassName } key={index}>

                            <NavLink to={prop.path} className="nav-link"
                              onClick={ () => ::this.linkClicked(index+1, prop.name) }>
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


export default connect()(Sidebar);
