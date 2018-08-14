// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import Multiselect from 'react-widgets/lib/Multiselect'
import Datetime from 'react-datetime';
import moment from 'moment';
import XLSX from 'xlsx';
import firebase from './firebase.js';
import Pagination from './TablePagination';
import { Container, Button,
  Row, Col, Card, CardHeader, CardBody,
  Tooltip,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import withAuth from './FirebaseAuth';

type Pupil = {
    id: String,
    groupId: String,
    unitId: String,
    pupilId: String,
    unitName: String,
    authority: String,
    groupName: String,
    name: String,
    lastName: String,
    birthDay: Date,
    phoneNumber: String,
    medicalLimitations:Boolean
}

type State = {
  pupils: Pupil[],
  authorities: String[],
  authoritiesLoaded: Boolean,
  selectedAuthorities: String[],
  loading: Boolean,
  displayedPupils: Pupil[],
  tooltipOpen: Boolean,
  modal: Boolean,
  unitId: String,
  groupId: String,
  pupilId2Delete: String
}

@withAuth
@withRouter
export default
class Pupils extends React.Component<{}, State> {

  state = {
    pupils: [],
    authorities: [],
    unitsLoaded: false,
    authoritiesLoaded: false,
    loading: true,
    selectedAuthorities: [],
    selectedUnits: [],
    displayedPupils: [],
    tooltipOpen: false,
    modal: false,
    unitId: '',
    groupId: '',
    pupilId2Delete: ''
  }

  constructor(props) {

    super(props);

    this.styles = {
      isClosed: {
        marginTop: '-16px'
      }
    }
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
          name: docData.name.trim(),
          region: docData.region.trim()
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

  async loadPupils(isAdmin: Boolean) {

    try {

      const getOptions = {
        source: 'server'
      }

      let self = this;
      const _pupils = [];
      const _units = [];
      const promises = [];
      const promises2 = [];
      const promises3 = [];

      promises.push(firebase.firestore().collection('units')
             .get(getOptions)
             .then(units => {
                units.docs.forEach( unit => {
                    const unitData = unit.data();
                    const unitId = unit.id;
                    const unitName = unitData.name_he.trim();
                    const unitSymbol = unitData.symbol.trim();
                    const authority = unitData.authority.trim();
                    _units.push({unitName, unitSymbol, unitId, authority})

                    promises2.push(firebase.firestore().collection('units')
                        .doc(unit.id).collection('groups')
                        .get(getOptions)
                        .then( groups => {

                            groups.docs.forEach( group => {
                                const groupData = group.data();
                                const groupId = group.id;
                                const groupSymbol = groupData.symbol.trim();
                                const groupName = groupData.name.trim();

                                promises3.push(firebase.firestore().collection('units')
                                    .doc(unitId).collection('groups')
                                    .doc(groupId).collection('pupils')
                                    .get(getOptions)
                                    .then(pupils => {
                                        pupils.forEach( pupil => {
                                            const pupilData = pupil.data();
                                            const id = pupil.id;

                                            _pupils.push({
                                                id: id,
                                                groupId: groupId,
                                                groupSymbol: groupSymbol,
                                                unitId: unitId,
                                                pupilId: pupilData.pupilId.trim(),
                                                unitName: unitName,
                                                authority: authority,
                                                groupName: groupName,
                                                name: pupilData.name.trim(),
                                                lastName: pupilData.lastName.trim(),
                                                birthDay: pupilData.birthDay ? moment.unix(pupilData.birthDay.seconds).format('DD/MM/YYYY') : '',
                                                phoneNumber: pupilData.phoneNumber.trim(),
                                                medicalLimitations: pupilData.medicalLimitations,
                                                isAdmin: isAdmin
                                            });

                                        });
                                    }));
                        });
                }));
             })

        }));
        Promise.all(promises)
        .then(() => {
          self.setState({
              units: _units,
              selectedUnits: _units,
              _units: _units,
              unitsLoaded: true
          })
            Promise.all(promises2)
            .then(() => {
                Promise.all(promises3)
                .then(() => {
                    self.setState({
                        units: _units,
                        pupils: _pupils,
                        displayedPupils: _pupils ,
                        loading: false
                    })
                });
            });
        });
    } catch( err ) {
        console.error(err);
    }

  }

  componentDidUpdate(prevProps: Props, prevState: State) {

    if( prevProps.userEMail !== this.props.userEMail) {

      const isAdmin = this.props.isAdmin;

      this.loadAuthorities();
      this.loadPupils(isAdmin);
    }

  }

  renderCheckable(cellInfo) {

    const pupilData = this.state.pupils[cellInfo.index];
    const _medicalLimitations = pupilData.medicalLimitations;

    return (
      <div className='form-check'
        style={{
          marginTop: '-16px'
        }}>
        <label className='form-check-label'>
          <input className='form-check-input'
            type='checkbox'
            className='checkbox'
            checked={_medicalLimitations}
          />
          <span className='form-check-sign'></span>
       </label>
     </div>)
  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  }

  editPupil(unitId: String,
            groupId: String,
            pupilId: String) {
    this.props.history.push(`/dashboard/addpupil/${unitId}/${groupId}/${pupilId}`);
  }

  async deletePupil() {

    if( this.state.unitId !== ''
      && this.state.groupId !== ''
      && this.state.pupilId2Delete !== '' ) {

      await firebase.firestore().collection('units').doc(this.state.unitId)
          .collection('groups').doc(this.state.groupId)
          .collection('pupils').doc(this.state.pupilId2Delete)
          .delete();

      this.setState({
        modal: !this.state.modal,
        unitId: '',
        groupId: '',
        pupilId2Delete: ''
      });

   }
  }

  toggleModal(unitId: String,
              groupId: String,
              pupilRecordId: String) {

      this.setState({
        modal: !this.state.modal,
        unitId: unitId,
        groupId: groupId,
        pupilId2Delete: pupilRecordId
      });
  }

  columns =[
    {
       Header:'ת.ז.',
       accessor:'pupilId',
       style:{
          lineHeight:'3em'
       }
    },
    {
       Header:'שם פרטי',
       accessor:'name',
       style:{
          lineHeight:'3em'
       }
    },
    {
       Header:'שם משפחה',
       accessor:'lastName',
       style:{
          lineHeight:'3em'
       }
    },
    {
       Header:'תאריך לידה',
       accessor:'birthDay',
       style:{
          lineHeight:'3em'
       }
    },
    {
       Header:'טלפון',
       accessor:'phoneNumber',
       style:{
          lineHeight:'3em'
       }
    },
    {
       Header:'מזהה כיתה',
       accessor:'groupSymbol',
       style:{
          lineHeight:'3em'
       }
    },
    {
       Header: 'מגבלות רפואיות',
       accessor:'medicalLimitations',
       Cell: ::this.renderCheckable,
       style: {
         lineHeight: '3em'
       }
    }, {
      Header: '',
      accessor: 'editors',
      width: 80,
      Cell: row => {

        const unitId = row.original.unitId;
        const groupId = row.original.groupId;
        const pupilRecordId = row.original.id;

        return <Row>
          <Col md='4'>
            <Button disabled={!row.original.isAdmin}
                    className='btn-round btn-icon btn btn-info btn-sm'
                    id='btnEditPupil'
                    style={{
                      'padding': '0'
                    }}
                    onClick={ () => ::this.editPupil(unitId, groupId, pupilRecordId) } >
                    <i className='fa fa-edit'></i>
            </Button>
          </Col>
          <Col md='4'>
              <Button disabled={!row.original.isAdmin}
                      className='btn-round btn-icon btn btn-danger btn-sm'
                      style={{
                        'padding': '0'
                      }}
                      onClick={ () => ::this.toggleModal(unitId, groupId, pupilRecordId) } >
                    <i className='fa fa-times'></i>
              </Button>
          </Col>
        </Row>
      }
    }];

  exportExcel() {
    const header = [''];
    this.columns.forEach( col => {header.push(col.Header);});
    const _export = {data: [ header ] };

    this.state.pupils.forEach( (pupil, index) => {
        const pupilData = [];
        pupilData.push(1 + index); // reserve 1 for caption row
        this.columns.forEach(col =>{
            pupilData.push(pupil[col.accessor]);
        })

        _export.data.push(pupilData);
    });

    /* create a new blank workbook */
    var workbook = XLSX.utils.book_new();
    console.log(workbook.Views);
    /* convert from array of arrays to workbook */
    var worksheet = XLSX.utils.aoa_to_sheet(_export.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'תלמידים');

    /* create view to RTL */
    if(!workbook.Workbook) workbook.Workbook = {};
    if(!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if(!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;

    /* write a workbook */
    XLSX.writeFile(workbook, 'pupils.xlsx');

  }

  async updateFirestore(pupilIndex: Number,
                        pupilId: String,
                        groupId: String,
                        unitId: String,
                        fieldName: String,
                        value) {

     const data = [...this.state.pupils];
     data[pupilIndex][fieldName] = value;
     this.setState({
        pupils: data
     });

     try {
        let json = {};
        const updateField = fieldName;
        json[updateField] = value;

        await firebase.firestore().collection('units')
                        .doc(unitId).collection('groups')
                        .doc(groupId).collection('pupils')
                        .doc(pupilId)
                        .update(json);
     } catch( err ) {
       console.error(err);
     }

  }


  onUnitChanged = (units) => {

    const _units = ( units.length !== 0 ) ? units : this.state.units;

    this.setState({
      selectedUnits: _units
    });
    this.filerPupils(this.state._units, _units)
    // this.filerPupils(this.state._units, this.state.selectedAuthorities.length, _units , _units.length)
  }


  onAuthorityChanged = (authorities) => {

    const _units = ( authorities.length !== 0 ) ?
                    ( this.state.units.filter( unit => {
                        return authorities.find( authority => {
                          return authority.name === unit.authority}
                        )
                      })) : this.state.units;

    this.setState({
      selectedAuthorities: authorities,
      _units: _units
    });
    this.filerPupils(_units, this.state.selectedUnits);

    // this.filerPupils(_units, authorities.length, this.state.selectedUnits, this.state.selectedUnits.length)
  }

  // filerPupils(unitsFromAuthorities, selectedAuthorities_length , unitsFromUnits, UFU_length){
  //   if (selectedAuthorities_length === 0 && UFU_length === 0) {
  filerPupils(unitsFromAuthorities , unitsFromUnits){
    if (this.state.selectedAuthorities.length === 0 && this.state.selectedUnits.length === 0) {
          this.setState({
            displayedPupils : this.state.pupils
        });
    } else {
        const incision = unitsFromAuthorities.filter( a_unit => {
          return unitsFromUnits.find( u_unit => {
            return a_unit.unitId === u_unit.unitId}
          )
        });

        const _pupils = this.state.pupils.filter( pupils => {
          return incision.find( unit => {
            return unit.unitId === pupils.unitId}
          )
        });

        this.setState({
          displayedPupils : _pupils
      });
    }
  }

  render() {


    const self = this;

    return <div>
              <div className='panel-header panel-header-sm'></div>
              <Container className='content h-100'>
                <Row>
                  <Col md='12'>
                    <Card>
                      <CardHeader>
                        <h5 className='title'>רשימת תלמידים</h5>
                      </CardHeader>
                      <CardBody>
                        <Row className='align-items-center'>
                          <Col md='3'>
                            <Multiselect
                              busy={!this.state.authoritiesLoaded}
                              groupBy='region'
                              textField='name'
                              isRtl={true}
                              placeholder='סנן לפי רשויות'
                              data={this.state.authorities}
                              onChange={ value => ::this.onAuthorityChanged(value) }
                            />
                          </Col>
                          <Col md='3'>
                            <Multiselect
                              busy={!this.state.unitsLoaded}
                              groupBy='authority'
                              textField='unitName'
                              isRtl={true}
                              placeholder='סנן לפי מוסדות'
                              data={this.state._units}
                              onChange={ value => ::this.onUnitChanged(value) }
                            />
                          </Col>
                          <Col md={{ size: 2, offset: 10 }}
                              className='text-right my-auto' id='tooltipContainer'>
                              <Button color='primary' id='btnExportExcel'
                                      onClick={::this.exportExcel}>
                                      Excel&nbsp;<i className="far fa-file-excel"></i>
                              </Button>

                              <Tooltip placement='auto'
                                autohide={false}
                                isOpen={this.state.tooltipOpen}
                                toggle={::this.toggle}
                                container='tooltipContainer'
                                style={{
                                  backgroundColor: 'black',
                                  color: 'white'
                                }}
                                target='btnExportExcel'>
                                  ייצוא לקובץ חיצוני
                              </Tooltip>
                          </Col>
                        </Row>
                        <Row>
                          <Col md='12'>
                            <Modal isOpen={this.state.modal}>
                              <ModalHeader>
                                מחיקת הנרשם
                              </ModalHeader>
                              <ModalBody>
                                אישור לפעולה זו תגרום לחיקה מוחלטת של כל נתוני הנרשם. זאת פעולה לא הפיכה.
                              </ModalBody>
                              <ModalFooter>
                                <Button color="primary" onClick={::this.deletePupil}>אישור</Button>{' '}
                                <Button color="secondary" onClick={() => ::this.toggleModal('', '', '')}>ביטול</Button>
                              </ModalFooter>
                            </Modal>
                            <ReactTable
                              filterable
                              PaginationComponent={Pagination}
                              getTheadThProps = { () => {
                                return {
                                  style: {
                                    'textAlign': 'right',
                                    'fontWeight': '700'
                                  }
                                }
                              }}
                              loading={this.state.loading}
                              loadingText='טוען נתונים...'
                              noDataText='אין נתונים להצגה'
                              previousText = 'קודם'
                              nextText = 'הבא'
                              pageText = 'עמוד'
                              ofText = 'מתוך'
                              rowsText = 'שורות'
                              data={this.state.displayedPupils}
                              columns={this.columns}/>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Container>
         </div>
  }

}
