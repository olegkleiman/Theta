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
import withAuth from './FirebaseAuth'
import PupilData from './model/PupilData';
import DropdownList from 'react-widgets/lib/DropdownList';

type Pupil = {
    id: String,
    unitId: String,
    unitName: String,
    authority: String,
    groupId: String,
    groupName: String,
    pupilId: String,
    firstName: String,
    lastName: String,
    birthDay: Date,
    medicalLimitations:Boolean,
    address: String,
    parentId: String,
    parentName: String,
    phoneNumber: String,
    parentId2: String,
    parentName2: String,
    phoneNumber2: String,
    paymentApprovalNumber: String,
    paymentType: String,
    waitingList: Boolean
}

const TextField = ({id, defaultValue, label, onChange, invalid, invalidMessage, className, disabled})  => {
  return(
    <Row>
      <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
        <div className='info-text'>{label}</div>
      </Col>
      <Col md={{ size: 4 }}>
        <Input id={id} name={label} disabled={disabled} defaultValue={defaultValue} onChange={onChange}></Input>
      </Col>
      <Col md='4'
        className={className}>
            {!invalid ? invalidMessage : undefined}
      </Col>
    </Row>)
}

const DatePicker = ({label, value, onChange, invalid, invalidMessage, className}) => {
    return(
      <Row>
        <Col md={{ size: 2, offset: 2}} className="text-right my-auto">
            {label}
        </Col>
        <Col md='4'>
          <Datetime id="datetime_test"
                    value={value}
                    closeOnSelect={true}
                    onChange={onChange}
                    timeFormat={false}
                    local='he' />
        </Col>
        <Col md='4'
            className={className}>
            {!invalid ? invalidMessage : undefined}
        </Col>
      </Row>
    )
}

const AutoComplete = ({lable, data, value, onChange ,busy, groupBy, textField, disabled}) => {
  let filterGroupName = (item, value) => {
    const groupSymbol = item[textField].substr(0, item[textField].length);
    return groupSymbol.indexOf(value) === 0;
  }

  let Item = ({ item }) => (
    <span>
      <strong>{item.name}</strong>
    </span>
  );
  return(
    <Row>
      <Col md={{ size: 2, offset: 2}} className="text-right my-auto">
          {lable}
      </Col>
      <Col md='4'>
        <DropdownList
            groupBy={groupBy}
            textField={textField}
            busy={busy}
            groupBy={groupBy}
            filter={filterGroupName}
            data={data}
            value={value}
            onChange={onChange}
            messages={ {
                  emptyFilter: 'לא נמצאו תוצאות סינון'
                }
            }/>
        </Col>
      </Row>)
}


type State = {
  units: Unit[],
  groups: Group[],
  authorities: String[],
  pupil: Pupil
}

@withAuth
export default
class AddPupil extends React.Component<{}, State> {

  state = {
    invalidField: '',
    status: '',
    formInalid: false,
    paymentTypeCredit: true
  }

  async loadAuthorities() {

    const getOptions = {
      source: 'server'
    }

    try {

      const authorities = await firebase.firestore().collection('authorities')
                               .get(getOptions);
      const authoritiesDocs = authorities.docs;
      const _authorities = authoritiesDocs.map( doc => {
        const docData = doc.data();
        return {
          name: docData.name,
          region: docData.region
        }
      });

      this.setState({
        authorities: _authorities,
        authoritiesLoaded: true
      })

    } catch( err ) {
      return new Error(err);
    }

  }

  async loadGroups() {

    try {
      const self = this;
      const getOptions = {
        source: 'server'
      }

      const _units = [];
      const _groups = [];
      const unitPromises =[]
      const units = await firebase.firestore().collection('units')
                            .get(getOptions)

      units.docs.forEach( (unit) => {
        const unitData = unit.data();
        _units.push({
          unitId:unit.id,
          unitName: unitData.name_he,
          authority: unitData.authority
        });
      })
      self.setState({units: _units, unitsLoaded: true}, () => {
        self.state.units.forEach( (unit) => {
          unitPromises.push(firebase.firestore().collection('units')
            .doc(unit.unitId).collection('groups')
            .get(getOptions)
            .then((groups) => {
              groups.docs.forEach( group => {

                const groupData = group.data();
                const groupId = group.id;

                _groups.push({
                  unitId: unit.unitId,
                  unitName: unit.unitName,
                  groupId: groupId,
                  groupName: groupData.name,
                  price: groupData.price
                });
              });
            })
          );
        });
        Promise.all(unitPromises).then(() => {
          self.setState({
            groups: _groups,
            groupsLoaded: true
          })
        });
      });
    } catch( err ) {
      return new Error(err);
    }

  }

  async componentDidMount() {



      const unitId = this.props.match.params.unitid;
      const groupId = this.props.match.params.groupid;
      const pupilId = this.props.match.params.pupilid;

      if( pupilId != 0 ) {

            try {
              let promises = [];
              let unit;
              let group;
              let pupil;

              promises.push(firebase.firestore().collection('units')
                .doc(unitId).get().then((_unit) => {
                  const unitData = _unit.data();
                  unit = {
                    unitId: unitId,
                    unitName: unitData.name_he,
                    authority: unitData.authority
                  };
                }));

              promises.push(firebase.firestore().collection('units')
                .doc(unitId).collection('groups').doc(groupId)
                .get().then((_group) => {
                  const groupData = _group.data();

                  group = {
                    unitId: unitId,
                    unitName: unit.unitName,
                    groupId: groupId,
                    groupName: groupData.name,
                    price: groupData.price
                  };
                }));

              promises.push(firebase.firestore().collection('units')
                .doc(unitId).collection('groups')
                .doc(groupId).collection('pupils')
                .doc(pupilId)
                .get().then(( _pupil) => {
                  if( _pupil.exists ) {
                    let pupilData = _pupil.data();
                    // Object.keys(pupilData).forEach(key => {
                    //   if(pupilData[key] === null || pupilData[key] === undefined){
                    //     delete pupilData[key];
                    //   }
                    //  })
                     pupilData.birthDay = moment(pupilData.birthDay);
                     this.setState({
                      pupil: pupilData
                     })
                  }
                })
              );

              Promise.all(promises).then( () => {
                this.setState({
                  componentState: 'edit',
                  defaultAuthority: unit.authority,
                  defaultUnit:  unit.unitName,
                  defaultGroup:  group.groupName,
                  selectedAuthority: unit.authority,
                  selectedUnit: unit,
                  selectedGroup: group

                })
              })


          } catch( err ) {
            console.error(err);
          }
      }
      else{
        this.setState({
          componentState: 'new',
          pupil : {},
          defaultAuthority: 'אנא בחר רשות' ,
          defaultUnit: 'אנא בחר מוסד' ,
          defaultGroup: 'אנא בחר כיתה' ,
          formInalid: false,
          paymentTypeCredit: true
        })
      }
      this.loadAuthorities();
      this.loadGroups();

  }

  birthDayChanged(_date: Date) {

    if( moment(_date).isValid() ) {
      this.state.pupil.birthDay = moment(_date);
      this.setState({
        pupil: this.state.pupil
      });
    }
  }

  validateGroup(group) {
    console.log(group);
  }

  onFormSubmit = async(event) => {
    event.preventDefault(); // stop from further submit

    let pupil = {
      pupilId: (event.target.pupilId.value) ? event.target.pupilId.value: undefined,
      firstName:(event.target.firstName.value) ? event.target.firstName.value: undefined,
      lastName: (event.target.lastName.value) ? event.target.lastName.value: undefined ,
      birthDay: (this.state.pupil.birthDay) ? this.state.pupil.birthDay: undefined ,
      medicalLimitations: (event.target.medicalLimitations.value === "on")? true : false,
      address:  (event.target.address.value) ? event.target.address.value: undefined ,
      parentId:  (event.target.parentId.value) ? event.target.parentId.value: undefined ,
      parentName: (event.target.parentName.value) ? event.target.parentName.value: undefined  ,
      phoneNumber:  (event.target.phoneNumber.value) ? event.target.phoneNumber.value: undefined ,
      parentId2:  (event.target.parentId.value) ? event.target.parentId.value: undefined ,
      parentName2:  (event.target.parentName.value) ? event.target.parentName.value: undefined ,
      phoneNumber2:  (event.target.phoneNumber.value) ? event.target.phoneNumber.value: undefined ,
      paymentApprovalNumber: (event.target.paymentApprovalNumber.value) ? event.target.paymentApprovalNumber.value: undefined ,
      paymentType:  (event.target.paymentTypeCash.checked) ? "cash": "credit" ,
      waitingList: (event.target.waitingList.value  === "on")? true : false,
    }

    Object.keys(pupil).forEach(key => {
      if(pupil[key] === null || pupil[key] === undefined){
        delete pupil[key];
      }
     })

    let _state = {};
    if (pupil) {
       _state.pupil = pupil;
    }



    //validation
    if( !(_state.pupil &&
        (this.state.selectedAuthority)  &&
        (this.state.selectedUnit) &&
        (this.state.selectedGroup)&&
        (_state.pupil.pupilId)&&
        (_state.pupil.firstName)&&
        (_state.pupil.lastName)&&
        (_state.pupil.birthDay)&&
        (_state.pupil.parentId)&&
        (_state.pupil.phoneNumber))) {
          _state.formInalid = true;
          this.setState(_state)
          return;
        }

        pupil.birthDay = pupil.birthDay.toDate()

      try {
        _state.formInalid = false;
        _state.status = 'נתוני ,תלמיד מתווספים למערכת. נא להמתין...';
        this.setState(_state)

        const toastId = toast.success('פרטי התלמיד מתעדכנים במערכת', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false
        });

            const unitId = this.state.selectedUnit.unitId;
            const groupId = this.state.selectedGroup.groupId;

            if(this.props.match.params.pupilid != 0){
              // update pupil in Firestore
              const doc = await firebase.firestore().collection('units')
              .doc(unitId).collection('groups')
              .doc(groupId).collection('pupils')
              .doc(this.props.match.params.pupilid)
              .update(pupil);
            }else{
              // Add new pupil to Firestore
              const doc = await firebase.firestore().collection('units')
              .doc(unitId).collection('groups')
              .doc(groupId).collection('pupils')
              .add(pupil);
            }




            toast.update(this.toastId,
                  {
                    render: 'פרטי התלמיד עודכנו במערכת',
                    type: toast.TYPE.SUCCESS,
                    autoClose: 3000,
                    className: css({
                      transform: "rotateY(360deg)",
                      transition: "transform 0.6sec"
                    })
                  });

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

  authorityChanged = (authority) => {


    const _units = this.state.units.filter( unit => {
        return authority.name === unit.authority
    });

    const _groups = this.state.groups.filter( group => {
      return _units.find( unit => {
        return unit.unitId === group.unitId
      })
    });

    this.state.pupil.authority = authority.name;
    this.setState({
      filterdUnits: _units,
      filterdGroups: _groups,
      selectedAuthority: authority,
      pupil: this.state.pupil
    });
  }

  unitChanged = (unit) => {
    const _groups = this.state.groups.filter( group => {
        return unit.unitId === group.unitId
      });


    this.state.pupil.unitId = unit.unitId;
    this.state.pupil.unitName = unit.unitName;
    this.setState({
      filterdGroups: _groups,
      selectedUnit: unit,
      pupil: this.state.pupil
    });
  }

  groupChanged = (group) => {
    this.state.pupil.groupId = group.groupId;
    this.state.pupil.groupName = group.groupName;
    this.setState({
      selectedGroup: group,
      pupil: this.state.pupil
    });
  }

  paymentTypeChanged = (e) => {
    this.setState({
      paymentTypeCredit: !this.state.paymentTypeCredit
    })
  }

  render() {

    let inalid = this.state.formInalid;
    const priceClassNames = classNames({
      'text-left my-auto' : true,
      'text-danger': inalid,
      'visible': inalid,
      'invisible': !inalid
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
                <h5 className='title'>הוספת תלמיד</h5>
              </div>
              <CardBody>
                <Card>
{this.state.pupil && <CardBody>
                      <Form onSubmit={::this.onFormSubmit}>
                        <Container>
                            <AutoComplete onChange={::this.authorityChanged}
                              lable="רשות" data={this.state.authorities} groupBy="region"
                              value={this.state.defaultAuthority}
                              busy={!this.state.authoritiesLoaded}
                              invalid={(!this.state.selectedAuthority).toString()}
                              textField="name"/>
                          	<br />
                          	<AutoComplete onChange={::this.unitChanged}
                              lable="מוסד" data={this.state.filterdUnits} groupBy="authority"
                              value={this.state.defaultUnit}
                              busy={!this.state.unitsLoaded}
                             invalid={(!this.state.selectedUnit).toString()}
                              textField="unitName" disabled/>
                          	<br />
                          	<AutoComplete onChange={::this.groupChanged}
                              lable="כיתה" data={this.state.filterdGroups} groupBy="unitName"
                              value={this.state.defaultGroup}
                              busy={!this.state.groupsLoaded}
                              invalid={(!this.state.selectedGroup).toString()}
                              textField="groupName" disabled/>
                          	<br />
                          	<TextField id="pupilId" label="ת.ז."
                              defaultValue={this.state.pupil.pupilId}
                              onChange={::this.validateGroup}
                              invalidMessage="שדה חובה"
                              className={priceClassNames}>
                            </TextField>
                          	<br />
                          	<TextField id="firstName" label="שם פרטי"
                                defaultValue={this.state.pupil.name}
                                onChange={::this.validateGroup}
                                invalidMessage="שדה חובה"
                                className={priceClassNames}/>
                          	<br />
                          	<TextField id="lastName" label="שם משפחה"
                               defaultValue={this.state.pupil.lastName}
                               onChange={::this.validateGroup}
                               invalidMessage="שדה חובה"
                               className={priceClassNames}/>
                          	<br />
                          	<DatePicker label="תאריך לידה"
                               value={this.state.pupil.birthDay}
                               onChange={::this.birthDayChanged}
                               invalidMessage="שדה חובה"
                               className={priceClassNames}/>
                          	<br/>
                            <Row>
                              <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                                <div className='info-text'>מגבלות רפואיות</div>
                              </Col>
                              <Col md='1' className="text-right my-auto">

                                  <div className='form-check'
                                    style={{
                                      marginTop: '-16px'
                                    }}>
                                    <label className='form-check-label'>
                                      <Input className='form-check-input'
                                        id="medicalLimitations"
                                        type='checkbox'
                                        className='checkbox'
                                        checked={this.state.pupil.medicalLimitations}
                                      />
                                      <span className='form-check-sign'></span>
                                   </label>
                                 </div>

                              </Col>
                            </Row>
                            <br/>
                          	<TextField id="address"
                               defaultValue={this.state.pupil.address}
                               label="כתובת"
                               onChange={::this.validateGroup}
                               className={priceClassNames}/>
                          	<br />
                          	<TextField id="parentId" label="ת.ז. הורה"
                               defaultValue={this.state.pupil.parentId}
                               onChange={::this.validateGroup}
                               invalidMessage="שדה חובה"
                               className={priceClassNames}/>
                          	<br />
                          	<TextField id="parentName" label="שם הורה"
                              onChange={::this.validateGroup}
                               className={priceClassNames}/>
                          	<br />
                            <TextField id="phoneNumber" label="טלפון הורה"
                               defaultValue={this.state.pupil.phoneNumber}
                               onChange={::this.validateGroup}
                               invalidMessage="שדה חובה"
                               className={priceClassNames}/>
                          	<br />
                          	<TextField id="parentId2" label="ת.ז. הורה נוסף"
                               onChange={::this.validateGroup}
                               className={priceClassNames}/>
                          	<br />
                          	<TextField id="parentName2" label="שם הורה נוסף"
                               onChange={::this.validateGroup}
                               className={priceClassNames}/>
                          	<br />
                          	<TextField id="phoneNumber2" label="טלפון נוסף"
                               onChange={::this.validateGroup}
                               className={priceClassNames}/>
                          	<br />
                          	<Row>
                              <Col md='1'>
                                 <Input id="paymentTypeCredit"
                                        type="radio" name="radio1"
                                        onChange={::this.paymentTypeChanged}/>
                               </Col>
                             <Col md='5'>
                          			<TextField id="paymentApprovalNumber"
                                  label="אישור תשלום"
                                  onChange={::this.validateGroup}
                                  className={priceClassNames}
                                  disabled={!this.state.paymentTypeCredit}/>
                              </Col>
                              <Col md='1'>
                                <Input id="paymentTypeCash" type="radio" name="radio2" onChange={::this.paymentTypeChanged}/>
                              </Col>
                              <Col md='5'>
                          			<TextField id="paymentTypeCash"  id="paymentApprovalNumber"  lable="מס' קבלה" onChange={::this.validateGroup}
                                  className={priceClassNames}
                                  disabled={this.state.paymentTypeCredit}/>
                              </Col>
                          	</Row>
                          	<br />
                            <Row>
                              <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                                <div className='info-text'>רשימת המתנה</div>
                              </Col>
                              <Col md={{ size: 4 }}>
                                 <Input id="waitingList" type="checkbox" name="waitingList"/>
                              </Col>
                              <Col md='4'
                                className={priceClassNames}>

                              </Col>
                            </Row>
                            <br/>
                            <Row>
                              <Col md={{ size: 1, offset: 10}}>
                                <Button type="submit" color='primary'>הוסף</Button>
                              </Col>
                            </Row>
                            <br/>
                            <br/>
                            <br/>
                        </Container>
                      </Form>
                    </CardBody>}
                </Card>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>)
  }

};
