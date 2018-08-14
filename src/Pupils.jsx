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
class Pupils extends React.Component<{}, State> {

  state = {
    pupils: [],
    authorities: [],
    authoritiesLoaded: false,
    loading: true,
    selectedAuthorities: [],
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
                    const unitName = unitData.name_he;
                    const unitSymbol = unitData.symbol;
                    const authority = unitData.authority;
                    _units.push({unitName, unitSymbol})

                    promises2.push(firebase.firestore().collection('units')
                        .doc(unit.id).collection('groups')
                        .get(getOptions)
                        .then( groups => {

                            groups.docs.forEach( group => {
                                const groupData = group.data();
                                const groupId = group.id;
                                const groupSymbol = groupData.symbol;
                                const groupName = groupData.name;

                                promises3.push(firebase.firestore().collection('units')
                                    .doc(unitId).collection('groups')
                                    .doc(groupId).collection('pupils')
                                    .get(getOptions)
                                    .then(pupils => {
                                        pupils.forEach( pupil => {
                                            const pupilData = pupil.data();
                                            const id = pupil.id;

                                            _pupils.push({
                                                id: id,//firestore id
                                                groupId: groupId,
                                                groupSymbol: groupSymbol,
                                                unitId: unitId,
                                                pupilId: pupilData.pupilId, //ת.ז.
                                                unitName: unitName,
                                                authority: authority,
                                                groupName: groupName,
                                                name: pupilData.name,
                                                lastName: pupilData.lastName,
                                                birthDay: pupilData.birthDay ? moment.unix(pupilData.birthDay.seconds).format('DD/MM/YYYY') : '',
                                                phoneNumber: pupilData.phoneNumber,
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
            Promise.all(promises2)
            .then(() => {
                Promise.all(promises3)
                .then(() => {
                    self.setState({
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
       style:{
          overflow:'visible'
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

  onAuthorityChanged = (authorities) => {

    if ( authorities != [] ) {
        const _authorities = authorities.map( authority => {
            return authority.name
          });

          const _pupils = this.state.pupils.filter( pupils => {
            return _authorities.find( authorityName => {
              return authorityName === pupils.authority}
            )
          });

          this.setState({
            selectedAuthorities: _authorities,
            displayedPupils : _pupils

          });
    }
    else {
        this.setState({
            selectedAuthorities: authorities,
            displayedPupils : this.state.pupils

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
                              placeholder='סנן לפי הרשיות'
                              data={this.state.authorities}
                              onChange={ value => ::this.onAuthorityChanged(value) }
                            />
                          </Col>
                          <Col md='3'>
                            <Multiselect
                              busy={!this.state.authoritiesLoaded}
                              groupBy='region'
                              textField='name'
                              isRtl={true}
                              placeholder='סנן לפי מוסדות'
                              data={this.state.authorities}
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

export default withRouter(Pupils)
