var fs = require('fs');
const readline = require('readline');
var parse = require('csv-parse');
require('firebase/firestore');
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import moment from 'moment';
import _ from 'lodash';
var serviceAccount = require("./theta-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://theta-1524876066401.firebaseio.com"
});

const firestore = admin.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);
var inputFile = 'groups.csv'

async function  getAdminUsers() {

  const secRoles = [];

}

function createGroup(data2post, interval) {

  return new Promise( (resolve, reject) => {
    setTimeout( () => {

        fetch('https://rishumon.com/api/elamayn/edit_class.php?secret=Day1%21', {
          // headers: {
          //     "Content-Type": "application/json",
          // },
          method: 'POST',
          body: JSON.stringify(data2post)
        })
        .then( res => {
            return res.json();
        })
        .then( data => {
            resolve(data);
        })
        .catch( err => {
            reject(err);
        });

    }, interval);
  })
}

var parser = parse({delimiter: ','}, async (err, data) => {

  if( err ) {
    console.log(err);
    return;
  }

  let groups = data.map( (row,index) => {

    let symbol = row[3];
    if( index !== 0 && symbol != '' ) {

      if( symbol.indexOf('-') !== -1 ) {
        symbol = symbol.replace('-', '');
      }

      //console.log(`Index: ${index}. Data: ${row}`);
      const groupSecRole = 'group_' + row[3];
      const unitSecRole = 'unit_' + row[3];

      const unit = {
        region: row[0],
        authority: row[1],
        cluster: row[2],
        symbol: row[5],
        name_he: row[7],
        education_type: row[8],
        type: row[9],
        sec_role: unitSecRole
      };

      const groupName = ( unit.type !== 'גן' ) ? unit.name_he + ' ' + row[4]
                        : row[4];
      const group = {
        symbol: row[3],
        name: groupName,
        model: row[6],
        education_type: row[8],
        price: (row[10]) ? row [10] : '0',
        capacity: row[12],
        openFrom: moment(row[14], 'DD/MM/YYYY'),
        openTill: moment(row[15], 'DD/MM/YYYY'),
        paymentInstallments: row[11],
        sec_role: groupSecRole,
        unit: unit
      }

      return group;
    }

  });

  groups = groups.filter( r => r); // remove empty groups, if any

  groups.forEach( (group, index) => {

      const data2post = {
        "groupSymbol": group.symbol,
        "description": group.name,
        "status": "1",
        "price": group.price,
        "paymentInstallments": group.paymentInstallments
      };

       if( index < 300) {

        // 1. Add new groups to Rishumon
        createGroup(data2post, index * 500)
        .then( res => {
          console.log(res);
          return group;
        })
        .then( group => {

          return firestore.collection('units')
                .where('symbol', '==', group.unit.symbol)
                //.where('education_type', '==', '')
                .get();
        })
        .then( unitsSnapshot => {

          if( unitsSnapshot.docs.length == 0 ) { // no such unit exists => create one
            console.log('CREATE UNIT: ' + group.unit.symbol);
          //   //
          //   // unitsSnapshot.forEach( unitDoc => {
          //   //   const unitData = unitDoc.data();
          //   //   console.log(`Unit id: ${unitData.symbol}. Unit edu type: ${unitData.education_type} Unit name: ${unitData.name_he}`);
          //   // })
          //
          }
          else if( unitsSnapshot.docs.length == 1 ) { // the unit exists => update its properties
            console.log('UPDATE UNIT ' + group.unit.symbol + '(' + group.unit + ')');

            let unitDocId = 0;
            unitsSnapshot.forEach( doc => {
              unitDocId = doc.id;
              console.log(unitDocId);

              return firestore.collection('units')
              .doc(unitDocId)
              .update({
                authority: group.unit.authority,
                cluster: group.unit.cluster,
                education_type: group.unit.education_type,
                name_he: group.unit.name_he,
                region: group.unit.region,
                sec_role: group.unit.sec_role,
                symbol: group.unit.symbol,
                type: group.unit.type
              });

            });

            return unitDocId;

          //}
          } else { // there are several units with same symbol => the error
            console.log('SEVERAL UNITS  ' + group.unit.symbol);
          }

        })
        .then( unitDocId  => {

          return firestore.collection('units')
                        .doc(unitDocId)
                        .collection('groups')
                        .where('symbol', '==', group.symbol)
                        .get();

        })
        .then( _groups => {

          const query = _groups.query;
          const unitDocId = query._referencePath.segments[1];

          if( _groups.empty ) {
            console.log('Group does not exists. Creating...');
            console.log(unitDocId);
            return firestore.collection('units')
                          .doc(unitDocId)
                          .collection('groups')
                          .add({
                              symbol: group.symbol,
                              capacity: group.capacity,
                              education_type: group.education_type,
                              price: group.price,
                              model: group.model,
                              name: group.name,
                              openFrom: group.openFrom.toDate(),
                              openTill: group.openTill.toDate(),
                              paymentInstallments : group.paymentInstallments,
                              sec_role: group.sec_role,
                              unit: group.unit
                          })
          } else {
            let groupDocId = 0;
            _groups.forEach( _group => {
              groupDocId = _group.id;
              return firestore.collection('units').doc(unitDocId)
                            .collection('groups').doc(groupDocId)
                            .update({
                              //symbol: group.symbol,
                              capacity: group.capacity,
                              education_type: group.education_type,
                              price: group.price,
                              model: group.model,
                              name: group.name,
                              openFrom: group.openFrom.toDate(),
                              openTill: group.openTill.toDate(),
                              paymentInstallments : group.paymentInstallments,
                              sec_role: group.sec_role,
                              unit: group.unit
                            });

            });
          }

        })
        .catch( err => {
          console.error(err);
        })
        .finally( () => {
          // console.log(index+1 + ': ' + group.symbol);
          // console.log(data2post);
        });

      }


  });

  // 3. Prepare group roles of all Admins
  // console.log('Ready to update Admin role');
  // const groupsSecRoles = groups.map( group => {
  //   return group.sec_role;
  // })
  // console.log(groupsSecRoles);
  //
  // // 4. Prepare unit roles of all Admins
  // const unitsSecRoles = groups.map( group => {
  //   return group.unit.sec_role;
  // })
  // console.log(unitsSecRoles);

  // 5. Update group roles of all Admins
  // const admins = await firestore.collection('users')
  //                 .where('role', '=', 'admin')
  //                 .get();
  //
  // admins.docs.forEach( adminDoc => {
  //   const adminData = adminDoc.data();
  //   console.log(adminData.sec_roles);
  // })


});

fs.createReadStream(inputFile)
.pipe(parser);
