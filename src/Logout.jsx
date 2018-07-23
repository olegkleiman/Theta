import React from 'react';
import { Button, Row, Col, Container, Form, FormGroup,
  Card, CardBody, CardTitle,
  Input, InputGroup, InputGroupAddon
} from 'reactstrap';

class Logout extends React.Component {

  render() {
    return (
      <Card>
        <CardTitle className='text-center'>
          Your credentials are unknown to the system.
        </CardTitle>
        <CardBody>
          <Container>
            <Row>
              <Col md='12' className='text-center'>
                <a href='/login'>Try with different credentials</a>
              </Col>
            </Row>

          </Container>
      </CardBody>
      </Card>
    )
  }

};

export default Logout;
