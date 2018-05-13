// flow
import React from 'react';
import { Container } from 'reactstrap';

const Footer = (props) => {

  return (
    <footer className="page-footer">
      <Container fluid={props.fluid ? true:false}>
        <nav>
          <ul>
            <li>About Us</li>
          </ul>
        </nav>
        <div className="copyright">
            &copy; {1900 + (new Date()).getYear()}, Design based on <a href="https://www.creative-tim.com/live/now-ui-dashboard-pro-react" target="_blank" rel="noopener noreferrer">Now UI Kit</a>
        </div>
        </Container>
    </footer>
  )
};

export default Footer;
