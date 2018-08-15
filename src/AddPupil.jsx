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
    name: String,
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

const DatePicker = ({label, defaultValue, onChange, invalid, invalidMessage, className}) => {
    return(
      <Row>
        <Col md={{ size: 2, offset: 2}} className="text-right my-auto">
            {label}
        </Col>
        <Col md='4'>
          <Datetime id="datetime_test"
                    defaultValue={defaultValue}
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

const AutoComplete = ({lable, data, value, onChange ,busy, groupBy, textField, disabled, invalid, invalidMessage, className}) => {
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
            disabled={disabled}
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
        <Col md='4'
            className={className}>
            {!invalid ? invalidMessage : undefined}
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
    disabledAuthority: false,
    disabledUnit: false,
    disabledGroup: false,
    formInalid: false,
    paymentTypeCash: false
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
          },()=>{
            if(self.state.selectedAuthority !== 'אנא בחר רשות'){
              let authority = {};
              authority.name = self.state.selectedAuthority;
              self.authorityChanged(authority);
            }
            if(self.state.selectedUnit !== 'אנא בחר מוסד'){
              self.unitChanged(self.state.selectedUnit);
            }
            if(self.state.selectedGroup !== 'אנא בחר כיתה'){
              self.groupChanged(self.state.selectedGroup);
            }
          })
        });
      });
    } catch( err ) {
      return new Error(err);
    }

  }

  async componentDidMount() {

      let promises = [];
      let unit;
      let group;
      let pupil;


      const unitId = this.props.match.params.unitid;
      const groupId = this.props.match.params.groupid;
      const pupilId = this.props.match.params.pupilid;

      if( unitId != 0 ) {
        this.setState({componnentHeader: "עריכת פרטי תלמיד"})
      } else {
        this.setState({componnentHeader: "הוספת תלמיד"})
      }

      if( unitId != 0 && groupId  != 0 ) {


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
      }

      if( pupilId != 0 ) {

            try {

              promises.push(firebase.firestore().collection('units')
                .doc(unitId).collection('groups')
                .doc(groupId).collection('pupils')
                .doc(pupilId)
                .get().then(( _pupil) => {
                  if( _pupil.exists ) {
                    let pupilData = _pupil.data();
                     pupilData.birthDay = moment.unix(pupilData.birthDay.seconds).format('DD/MM/YYYY');
                     this.setState({
                      pupil: pupilData
                     })
                  }
                })
              );

              Promise.all(promises).then( () => {
                let componnentHeader = "עריכת פרטי תלמיד: " + this.state.pupil.name + " " + this.state.pupil.lastName;
                let authority ={};
                authority.name = unit.authority;
                this.setState({
                  componentState: 'edit',
                  componnentHeader: componnentHeader,
                  disabledAuthority: true,
                  disabledUnit: false,
                  disabledGroup: false,
                  selectedAuthority: unit.authority,
                  selectedUnit: unit,
                  formInalid: false,
                  selectedGroup: group

                })
              })



          } catch( err ) {
            console.error(err);
          }
      }
      else{
        Promise.all(promises).then( () => {
          this.setState({
            componentState: 'new',
            pupil : {},
            selectedAuthority: (unit) ? unit.authority : 'אנא בחר רשות' ,
            selectedUnit: (unit) ? unit : 'אנא בחר מוסד' ,
            selectedGroup: (group) ? group :'אנא בחר כיתה' ,
            disabledAuthority: false,
            disabledUnit: true,
            disabledGroup: true,
            formInalid: false,
            paymentTypeCash: true
          })
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


  onFormSubmit = async(event) => {
    event.preventDefault(); // stop from further submit

    let pupil = {
      pupilId: (event.target.pupilId.value) ? event.target.pupilId.value: undefined,
      name:(event.target.name.value) ? event.target.name.value: undefined,
      lastName: (event.target.lastName.value) ? event.target.lastName.value: undefined ,
      birthDay: (this.state.pupil.birthDay) ? this.state.pupil.birthDay: undefined ,
      medicalLimitations: (event.target.medicalLimitations.checked) ? true : false,
      address: (event.target.address.value) ? event.target.address.value: undefined ,
      parentId: (event.target.parentId.value) ? event.target.parentId.value: undefined ,
      parentName: (event.target.parentName.value) ? event.target.parentName.value: undefined  ,
      phoneNumber: (event.target.phoneNumber.value) ? event.target.phoneNumber.value: undefined ,
      parentId2: (event.target.parentId.value) ? event.target.parentId.value: undefined ,
      parentName2: (event.target.parentName.value) ? event.target.parentName.value: undefined ,
      phoneNumber2: (event.target.phoneNumber.value) ? event.target.phoneNumber.value: undefined ,
      paymentApprovalNumber: (event.target.paymentApprovalNumber.value) ? event.target.paymentApprovalNumber.value: undefined ,
      receiveNumber: (event.target.paymentTypeCash.checked) ? event.target.receiveNumber.value : undefined ,
      waitingList: (event.target.waitingList.checked)? true : false,
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
        (this.state.selectedAuthority !== 'אנא בחר רשות' )&&
        (this.state.selectedUnit !==  'אנא בחר מוסד')&&
        (this.state.selectedGroup !== 'אנא בחר כיתה')&&
        (_state.pupil.pupilId)&&
        (_state.pupil.name)&&
        (_state.pupil.lastName)&&
        (_state.pupil.birthDay)&&
        (_state.pupil.parentId)&&
        (_state.pupil.phoneNumber)&&
        (!event.target.paymentTypeCash.checked || !!event.target.receiveNumber.value))) {
          _state.formInalid = true;
          this.setState(_state)
          return;
        }

        pupil.birthDay = moment(pupil.birthDay).toDate();

      try {
        _state.formInalid = false;
        _state.status = 'נתוני ,תלמיד מתעדכנים למערכת. נא להמתין...';
        this.setState(_state)

        const toastId = toast.success('פרטי התלמיד מתעדכנים במערכת', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            //draggable: false
        });

            const unitId = this.state.selectedUnit.unitId;
            const groupId = this.state.selectedGroup.groupId;

            if(this.props.match.params.pupilid != 0) {

              if(groupId !== this.props.match.params.groupid) {
                await firebase.firestore().collection('units')
                  .doc(unitId).collection('groups')
                  .doc(groupId).collection('pupils')
                  .add(pupil)
                  .then(( ) =>{
                      // delete pupil from group
                      firebase.firestore().collection('units')
                      .doc(this.props.match.params.unitid).collection('groups')
                      .doc(this.props.match.params.groupid).collection('pupils')
                      .doc(this.props.match.params.pupilid)
                      .delete()
                      .then(function() {
                          console.log("Document successfully deleted!");
                      }).catch(function(error) {
                          console.error("Error removing document: ", error);
                      });
                  });
              }else{

                await firebase.firestore().collection('units')
                  .doc(this.props.match.params.unitid).collection('groups')
                  .doc(this.props.match.params.groupid).collection('pupils')
                  .doc(this.props.match.params.pupilid)
                  .update(pupil);
              }
            } else {
              // Add new pupil to Firestore
              await firebase.firestore().collection('units')
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
      disabledUnit: false,
      filterdUnits: _units,
      filterdGroups: _groups,
      selectedAuthority: authority,
      selectedUnit: 'אנא בחר מוסד',
      selectedGroup: 'אנא בחר כיתה',
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
      disabledGroup: false,
      filterdGroups: _groups,
      selectedUnit: unit,
      selectedGroup: 'אנא בחר כיתה',
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
      paymentTypeCash: !this.state.paymentTypeCash
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
                <h5 className='title'>{this.state.componnentHeader}</h5>
              </div>
              <CardBody>
                <Card>
{this.state.pupil && <CardBody>
                      <Form onSubmit={::this.onFormSubmit}>
                        <Container>
                          <AutoComplete onChange={::this.authorityChanged}
                            lable="רשות" data={this.state.authorities} groupBy="region"
                            value={this.state.selectedAuthority}
                            busy={!this.state.authoritiesLoaded}
                            textField="name"
                            invalidMessage="שדה חובה"
                            className={priceClassNames}
                            disabled={this.state.disabledAuthority}/>
                          <br />
                          <AutoComplete onChange={::this.unitChanged}
                            lable="מוסד" data={this.state.filterdUnits} groupBy="authority"
                            value={this.state.selectedUnit}
                            busy={!this.state.unitsLoaded}
                            textField="unitName"
                            invalidMessage="שדה חובה"
                            className={priceClassNames}
                            disabled={this.state.disabledUnit}/>
                          <br />
                          <AutoComplete onChange={::this.groupChanged}
                            lable="כיתה" data={this.state.filterdGroups} groupBy="unitName"
                            value={this.state.selectedGroup}
                            busy={!this.state.groupsLoaded}
                            textField="groupName"
                            invalidMessage="שדה חובה"
                            className={priceClassNames}
                            disabled={this.state.disabledGroup}/>
                          <br />
                          <TextField id="pupilId" label="ת.ז."
                            defaultValue={this.state.pupil.pupilId}
                            invalidMessage="שדה חובה"
                            className={priceClassNames}>
                          </TextField>
                          <br />
                          <TextField id="name" label="שם פרטי"
                              defaultValue={this.state.pupil.name}
                              invalidMessage="שדה חובה"
                              className={priceClassNames}/>
                          <br />
                          <TextField id="lastName" label="שם משפחה"
                              defaultValue={this.state.pupil.lastName}
                              invalidMessage="שדה חובה"
                              className={priceClassNames}/>
                          <br />
                          <DatePicker label="תאריך לידה"
                              defaultValue={this.state.pupil.birthDay}
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
                                      defaultChecked={this.state.pupil.medicalLimitations}
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
                              className={priceClassNames}/>
                          <br />
                          <TextField id="parentId" label="ת.ז. הורה"
                              defaultValue={this.state.pupil.parentId}
                              invalidMessage="שדה חובה"
                              className={priceClassNames}/>
                          <br />
                          <TextField id="parentName"
                              defaultValue={this.state.pupil.parentName}
                              label="שם הורה"
                              className={priceClassNames}/>

                          <br />
                          <TextField id="phoneNumber" label="טלפון הורה"
                              defaultValue={this.state.pupil.phoneNumber}
                              invalidMessage="שדה חובה"
                              className={priceClassNames}/>
                          <br />
                          <TextField id="parentId2" label="ת.ז. הורה נוסף"
                              defaultValue={this.state.pupil.parentId2}
                              className={priceClassNames}/>
                          <br />
                          <TextField id="parentName2" label="שם הורה נוסף"
                              defaultValue={this.state.pupil.parentName2}
                              className={priceClassNames}/>
                          <br />
                          <TextField id="phoneNumber2" label="טלפון נוסף"
                              defaultValue={this.state.pupil.phoneNumber2}
                              className={priceClassNames}/>
                          <br />
                          <TextField id="paymentApprovalNumber"
                            label="אישור תשלום טלפוני"
                            defaultValue={this.state.pupil.paymentApprovalNumber}
                            className={priceClassNames}
                            disabled={true}/>
                          <br/>
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>תשלום במשרד</div>
                            </Col>
                            <Col md='1' className="text-right my-auto">
                              <div className='form-check'>
                                <label className='form-check-label'
                                  style={{
                                    paddingLeft: '0px',
                                    paddingBottom: '30px'
                                  }}>
                                  <Input  className='form-check-input checkbox'
                                  id="paymentTypeCash"
                                  type="checkbox"
                                  className='checkbox'
                                  onChange={::this.paymentTypeChanged}
                                  checked={this.state.paymentTypeCash}/>
                                  <span className='form-check-sign'></span>
                                </label>
                              </div>
                            </Col>
                            <Col md='5'>
                              <TextField id="receiveNumber"
                                label="מס' קבלה"
                                defaultValue={this.state.pupil.receiveNumber}
                                className={priceClassNames}
                                disabled={!this.state.paymentTypeCash}/>
                            </Col>
                            <Col md='2'
                              className={priceClassNames}>
                                  {(this.state.paymentTypeCash) ? "שדה חובה" : undefined}
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col md={{ size: 2, offset: 2 }} className="text-right my-auto">
                              <div className='info-text'>רשימת המתנה</div>
                            </Col>
                            <Col md='1' className="text-right my-auto">

                                <div className='form-check'
                                  style={{
                                    marginTop: '-16px'
                                  }}>
                                  <label className='form-check-label'>
                                  <Input  className='form-check-input'
                                    id="waitingList"
                                    type="checkbox"
                                    className='checkbox'/>

                                    <span className='form-check-sign'></span>
                                  </label>
                                </div>

                            </Col>
                          </Row>
                          <br/>
                          <Row>
                            <Col md={{ size: 1, offset: 10}}>
                              <Button type="submit" color='primary'>שמור</Button>
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
