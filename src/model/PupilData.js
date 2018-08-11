// @flow
import moment from 'moment';

export default
class Pupil {
  recordId: String;
  name: String;
  id: String;
  phoneNumber: String;
  medicalLimitations: Boolean;
  birthDay: String;
  whenRegistered: Timestamp;
  parentId: String;
  address: String;

  constructor(recordId: String,
              name: String,
              lastName: String,
              id: String,
              phoneNumber: String,
              medicalLimitations: Boolean,
              birthDay: String,
              whenRegistered: Timestamp,
              parentId: String,
              address: String) {
    this.recordId = ( recordId ) ? recordId : '';
    this.name = ( name ) ? name : '';
    this.lastName = ( lastName ) ? lastName : '';
    this.id = ( id ) ? id: '';
    this.phoneNumber = ( phoneNumber ) ? phoneNumber : '';
    this.medicalLimitations = ( medicalLimitations ) ? medicalLimitations : false;
    this.birthDay = ( birthDay ) ?
                          moment.unix(birthDay.seconds).format('DD/MM/YYYY') :
                          null;

    this.whenRegistered = ( whenRegistered ) ?
                          moment.unix(whenRegistered.seconds).format('DD/MM/YYYY HH:mm') :
                          null;
    this.parentId = ( parentId ) ? parentId : '';
    this.address = ( address ) ? address : '';
  }
}
