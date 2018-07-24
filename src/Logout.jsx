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
          לצערנו אין לך הרשאות גישה למערכת
        </CardTitle>
        <CardBody>
          <Container>
            <Row>
              <Col md='12' className='text-center'>
                <a href='/login'>נסה כמשתמש אחר</a>
              </Col>
            </Row>

          </Container>
      </CardBody>
      </Card>
    )
  }

};

export default Logout;
