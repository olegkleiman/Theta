// @flow
import React from 'react';
import { Button, Row, Col, Container, Form, FormGroup,
  Card, CardBody, CardTitle,
  Input, InputGroup, InputGroupAddon,
  Alert
} from 'reactstrap';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { css } from 'glamor';
import moment from 'moment';
import _ from 'moment/locale/he';
import classNames from 'classnames';
import firebase from './firebase.js';
import withAuth from './FirebaseAuth';
import GroupData from './model/GroupData';

type State = {
  unit: Object,
  groupData: GroupData,
  fromDate: moment,
  tillDate: moment,
  invalidField: String,
  status: ''
}


@withAuth
export default
class AddGroup extends React.Component<{}, State> {

  state = {
    unit: {},
    groupData: {
      name: '',
      symbol: '',
      price: 0,
      capacity: 0,
      openFrom: moment(),
      openTill: moment()
    },
    invalidField: '',
    status: ''
  }

  async componentDidMount() {

    const unitId = this.props.match.params.unitid;
    let unitName = '<Unknown>';

    try {
      const resp = await firebase.firestore().collection('units').doc(unitId)
                         .get();
      const docData = resp.data();

      const _unit = {
        name_he: docData.name_he,
        type: docData.type,
        authority: docData.authority,
        cluster: docData.cluster,
        education_type: docData.education_type,
        region: docData.region,
        symbol: docData.symbol,
        sec_role: docData.sec_role
      }

      this.setState({
        unit: _unit
      })
    }
    catch( err ) {
        console.error(err);
    }

    const groupId = this.props.match.params.groupid;
    if( groupId != 0 ) {

      try {
        const groupDoc = await firebase.firestore().collection('units').doc(unitId)
                            .collection('groups').doc(groupId)
                            .get();
        const _groupData = groupDoc.data();
        const groupData =
            new GroupData(_groupData.name,
                          _groupData.symbol,
                          _groupData.capacity,
                          _groupData.price,
                          _groupData.openFrom,
                          _groupData.openTill,
                          _groupData.paymentInstallments);

        this.setState({
          groupData: groupData
        })
      } catch( err ) {
        console.log(err);
      }

    }

  }

  _fromDateChanged(_date: Date) {

    if( moment(_date).isValid() ) {

      let _groupData = this.state.groupData;
      _groupData.openFrom = moment(_date);

      this.setState({
        fromDate: moment(_date)
      });
    }
  }

  _tillDateChanged(_date: Date) {

    if( moment(_date).isValid() ) {

      let _groupData = this.state.groupData;
      _groupData.openTill = moment(_date);

      this.setState({
        groupData: _groupData
      });
    }
  }

  validateGroup(group) {

    const unitId = this.props.match.params.unitid;

    if( moment(group.openFrom).isAfter(moment(group.openTill)) ) {
      group.validated = false;
      group.invalidField = 'openedTill';
      return group;
    }

    if( group.name === '' ) {
      group.validated = false;
      group.invalidField = 'groupName';
      return group;
    }

    if( group.capacity === '' ) {
      group.validated = false;
      group.invalidField = 'groupCapacity';
      return group;
    }

    if( group.price === '' ) {
      group.validated = false;
      group.invalidField = 'groupPrice';
      return group;
    }

    if( group.symbol === '' ) {
      group.validated = false;
      group.invalidField = 'groupSymbol';
      return group;
    }

    if( this.props.match.params.groupid !== '0' ) { // // editing existing group

      group.validated = true;
      return Promise.resolve(group);

    } else {

      return new Promise( (resolve, reject) => {

        try {
          firebase.firestore().collection('units')
                      .doc(unitId).collection('groups')
                      .where('symbol', '==', group.symbol)
                      .get()
                      .then( query => {

                        if( query.docs.length > 0 ) {
                          group.validated = false;
                          group.invalidField = 'symbol';
                          resolve(group)
                        } else {
                          group.validated = true;
                          resolve(group)
                        }

                      })
                      .catch( err => {
                        console.error( err );
                        reject(err);
                      })

        } catch( err ) {
          reject(err);
        }

      })
    }

  }

  onFormSubmit = async(event) => {

    event.preventDefault(); // stop from further submit

    const toastMessage = ( this.props.match.params.groupid === '0') ?
      'נתוני כיתה מתווספים למערכת. נא להמתין...' :
      'נתוני כיתה מתעדכנים במערכת. נא להמתין...';

    this.setState({
      status: toastMessage
    })

    if( !this.state.groupData.openFrom ) {
        this.setState({
          invalidField: 'openedFrom',
          status: ''
        });
        return;
    }
    if( !this.state.groupData.openTill ) {
        this.setState({
          invalidField: 'openedTill',
          status: ''
        });
        return;
    }

    const group = {
      name: event.target.groupName.value,
      symbol: event.target.symbol.value,
      capacity: event.target.groupCapacity.value,
      openFrom: this.state.groupData.openFrom.toDate(),
      openTill: this.state.groupData.openTill.toDate(),
      price: event.target.price.value,
      sec_role: `group_${event.target.symbol.value}`,
      registeredPupils: 0,
      paymentInstallments: event.target.payments.value,
      unit: this.state.unit
    }

    const _group = await ::this.validateGroup(group)
    if( !_group.validated ) {

      this.setState({
        invalidField: group.invalidField,
        status: ''
      });

      return;
    }

    const toastId = toast.success(toastMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        //draggable: false
    });

    const unitId = this.props.match.params.unitid;

    try {

      // Statuses of newly created group for Rishumon
      // 1 - Open
      // 2 - Till date was expired
      // 3 - Group is full
      // 4 - Close

      const description = ( this.state.unit.type.trim() != "גן" ) ?
                           this.state.unit.name_he + group.name :
                           group.name;

      const data2post = {
        "groupSymbol": group.symbol,
        "description": description,
        "status": "1",
        "price": group.price
      };

      await fetch('https://rishumon.com/api/elamayn/edit_class.php?secret=Day1%21', {
        // headers: {
        //     "Content-Type": "application/json",
        // },
        mode: 'no-cors', // no-cors prevents reading the response
        method: 'POST',
        body: JSON.stringify(data2post)
      });

      // Add new or update group to/in Firestore
      if( this.props.match.params.groupid === '0' ) {
        const doc = await firebase.firestore()
                      .collection('units').doc(unitId)
                      .collection('groups')
                      .add(group);
      } else {
        const doc = await firebase.firestore()
                      .collection('units').doc(unitId)
                      .collection('groups').doc(this.props.match.params.groupid)
                      .update(group);
      }

      // Grant permissions to current user
      // let response = await firebase.firestore().collection('users')
      //                                 .where("email", "==", this.props.userEMail)
      //                                 .get();
      // if( response.docs.length != 0 ) {
      //   const userDoc = response.docs[0];
      //   const secRoles = this.props.secRoles;
      //   secRoles.push(group.sec_role);
      //
      //   await firebase.firestore().collection('users')
      //         .doc(userDoc.id)
      //         .update({
      //            sec_roles: secRoles
      //         })
      //
      //         toast.update(this.toastId,
      //               {
      //                 render: 'כיתה חדשה התווספה',
      //                 type: toast.TYPE.SUCCESS,
      //                 autoClose: 3000,
      //                 className: css({
      //                   transform: "rotateY(360deg)",
      //                   transition: "transform 0.6sec"
      //                 })
      //               });
      //
      // }

      setTimeout( () => this.props.history.push(`/dashboard/units`),
                 1500);

    } catch( err ) {
      console.error(err);
      toast.update(this.toastId,
                    {
                      render: 'פעולה נכשלה עקב בעיית התקשורת.',
                      type: toast.TYPE.ERROR,
                      autoClose: 5000,
                    }
                  );
    }
  }

  handleNameChange(event) {
    let groupData = this.state.groupData;
    groupData.name = event.target.value;
    this.setState({
      groupData: groupData
    });
  }

  handleSymbolChange(event) {
    let groupData = this.state.groupData;
    groupData.symbol = event.target.value;
    this.setState({
      groupData: groupData
    });
  }

  handleCapacityChange(event) {
    let groupData = this.state.groupData;
    groupData.capacity = event.target.value;
    this.setState({
      groupData: groupData
    });
  }

  handlePriceChange(event) {
    let groupData = this.state.groupData;
    groupData.price= event.target.value;
    this.setState({
      groupData: groupData
    });
  }

  handlePaymentsChange(event) {
    let groupData = this.state.groupData;
    groupData.payments= event.target.value;
    this.setState({
      groupData: groupData
    });
  }

  render() {

    let saveButtonText = 'הוסף';
    let captionText = 'הוספת כיתה חדשה למוסד';

    if( this.props.match.params.groupid != 0 )  {
      saveButtonText = 'שמור';
      captionText = 'עריכת נתוני כיתה למוסד'
    }

    captionText += (' ' + this.state.unit.name_he);

    let isThisField = this.state.invalidField === 'symbol';
    const groupSymbolClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    });

    isThisField = this.state.invalidField === 'groupName';
    const groupNameClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    });

    isThisField = this.state.invalidField === 'openedFrom';
    const fromClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    });

    isThisField = this.state.invalidField === 'openedTill';
    const tillClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    });

    isThisField = this.state.invalidField === 'groupCapacity';
    const capacityClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    })

    isThisField = this.state.invalidField === 'groupPrice';
    const priceClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    })

    isThisField = this.state.invalidField === 'payments';
    const paymentsClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': isThisField,
      'visible': isThisField,
      'invisible': !isThisField
    })

    return (<div>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl
          pauseOnVisibilityChange={false}
          draggable={false}
          pauseOnHover={false}
          />
      <div className='panel-header panel-header-sm'></div>
      <div className='content container h-100'>
        <Row>
          <Col className='col-md-12'>
            <Card body className="text-center">
              <div className='card-header'>
                <h5 className='title'>{captionText} {this.state.unitName}</h5>
              </div>
              <CardBody>
                <Card>
                    <CardBody>
                      <Form onSubmit={::this.onFormSubmit}>
                        <Container>
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>שם כיתה</div>
                            </Col>
                            <Col md={{ size: 4 }}>
                              <Input id='groupName' name='groupName'
                                      value={this.state.groupData.name}
                                      onChange={::this.handleNameChange}></Input>
                            </Col>
                            <Col md='4' invalid={(this.state.invalidField === 'groupName').toString()}
                              className={groupNameClassNames}>
                              אנא הזן ערך
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              מזהה
                            </Col>
                            <Col md='4'>
                                <Input id='symbol' name='symbol'
                                       value={this.state.groupData.symbol}
                                       type='number' placeholder="רק מספרים שלמים"
                                       onChange={::this.handleSymbolChange}/>
                            </Col>
                            <Col md='4' invalid={(this.state.invalidField === 'symbol').toString()}
                              className={groupSymbolClassNames}>
                              כיתה עם מזהה כזה כבר קיימת במערכת
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              נפתח בתאריך
                            </Col>
                            <Col md='4'>
                              <Datetime closeOnSelect={true}
                                        onChange={::this._fromDateChanged}
                                        timeFormat={false}
                                        value={this.state.groupData.openFrom}
                                        local='he' />
                            </Col>
                            <Col md='4' invlalid={(this.state.invalidField === 'openedFrom').toString()}
                              className={fromClassNames}>
                              אנא הזן תאריך
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2}} className="text-right my-auto">
                              פעיל עד תאריך
                            </Col>
                            <Col md='4'>
                              <Datetime closeOnSelect={true}
                                        onChange={::this._tillDateChanged}
                                        timeFormat={false}
                                        value={this.state.groupData.openTill}
                                        local='he' />
                            </Col>
                            <Col md='4' invlalid={(this.state.invalidField === 'openedTill').toString()}
                                className={tillClassNames}>
                              לא נותר זמן ליהנות בקבוצה זו
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              כמות מקומות
                            </Col>
                            <Col md='4'>
                              <Input id='groupCapacity' name='groupCapacity'
                                     type='number' placeholder="רק מספרים שלמים"
                                     value={this.state.groupData.capacity}
                                     onChange={::this.handleCapacityChange}/>
                            </Col>
                            <Col md='4' invlalid={(this.state.invalidField === 'groupCapacity').toString()}
                              className={capacityClassNames}>
                              אנא הזן ערך
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              מחיר
                            </Col>
                            <Col md='4'>
                              <InputGroup>
                                <Input id='price' name='price'
                                       type='number'
                                       placeholder="מספרים כמחיר, כמו 650.40, 510"
                                       value={this.state.groupData.price}
                                       onChange={::this.handlePriceChange}/>
                                <InputGroupAddon addonType="append">₪</InputGroupAddon>
                              </InputGroup>
                            </Col>
                            <Col md='4' invlalid={(this.state.invalidField === 'groupPrice').toString()}
                              className={priceClassNames}>
                              אנא הזן ערך
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              מספר תשלומים
                            </Col>
                            <Col md='4'>
                              <Input id='payments' name='payments'
                                type='number' placeholder="רק מספרים שלמים"
                                value={this.state.groupData.payments}
                                onChange={::this.handlePaymentsChange}/>
                            </Col>
                            <Col md='4' invlalid={(this.state.invalidField === 'payments').toString()}
                              className={paymentsClassNames}>
                              אנא הזן ערך
                            </Col>
                          </Row>
                          <Row>
                            <Col md={{ size: 1, offset: 10}}>
                              <Button type="submit" color='primary'>{saveButtonText}</Button>
                            </Col>
                          </Row>
                          <br/>
                          <br/>
                          <br/>
                        </Container>
                      </Form>
                    </CardBody>
                </Card>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>)
  }

};
