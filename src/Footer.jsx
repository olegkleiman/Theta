// flow
import React from 'react';
import { Container } from 'reactstrap';

const Footer = (props) => {

  return (
    <footer className={"footer"
        + (props.default ? " footer-default":"")
    }>
      <Container fluid={props.fluid ? true:false}>
          <div className='row justify-content-md-center'>
              <div className='col'>
                <div className="copyright">
                    &copy; {1900 + (new Date()).getYear()}, Designed by <a href="https://www.invisionapp.com" target="_blank" rel="noopener noreferrer">Invision</a>
                </div>

              </div>
          </div>
        </Container>);
    </footer>
  )
};

export default Footer;
