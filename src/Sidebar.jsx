// @flow
import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { Nav } from 'reactstrap';

import logo from './logo.png';

type State = {
  currentLink: number
};

@connect()
export default
class Sidebar extends React.Component<{}, State> {

  state = {
    currentLink: 1
  }

  constructor(props) {
    super(props);

    this.styles = {
      logoStyle : {
        width: '106px'
      },
      logoTitle: {
        overflow: 'inherit',
        textAlign: 'center'
      }
    }
  }

  linkClicked = (linkNumber: number, pageName: String) => {

    this.setState({
      currentLink: linkNumber
    });

    this.props.dispatch({
      type: 'PAGE_NAVIGATED',
      data: {
        pageName: pageName
      }
    });
  }

  render() {
    return <div className="sidebar" data-color="blue">
              <div className="logo">
                <a href='#' style={this.styles.logoStyle} className="simple-text logo-mini">
                      <div className="logo-img">
                          <img src={logo} alt="theta-logo" />
                      </div>
                </a>
                <a href='#' style={this.styles.logoTitle} className="simple-text logo-normal">
                   צהרוני נצנים
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
                              <i className={prop.icon}></i>
                              <p className='sidebar_item'>{prop.name}</p>
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
