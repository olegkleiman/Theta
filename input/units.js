var fs = require('fs');
const readline = require('readline');
var parse = require('csv-parse');
require('firebase/firestore');
import * as admin from 'firebase-admin';
var serviceAccount = require("./theta-restore-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://thetadev-49eb5.firebaseio.com"
});

const firestore = admin.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);
var inputFile = 'units.csv'

const secRoles = [];

var parser = parse({delimiter: ','}, async (err, data) => {

  if( err ) {
    console.log(err);
    return;
  }

  const promises = data.map( async(row,index) => {

    let symbol = row[3];
    if( index !== 0 && symbol != '' ) {

      if( symbol.indexOf('-') !== -1 ) {
        symbol = symbol.replace('-', '');
      }

      console.log(`Index: ${index}. Data: ${row}`);
      const sec_role = 'unit_' + row[3];
      console.log(`Symbol ${symbol}. Sec Role: ${sec_role}`);

      const res = await firestore.collection('units').add({
        name_he: row[5],
        authority: row[1],
        symbol: symbol,
        sec_role: sec_role,
        education_type: row[6],
        type: row[7]
      })

      return sec_role;
    }

  });

  let secRoles = await Promise.all(promises);
  secRoles = secRoles.filter( r => r); // remove nulls
  rolesUpdater(secRoles);

});

async function rolesUpdater(secRoles) {

  const promises = secRoles.map( async(row, index) => {

      const usersSnap = await firestore.collection('users').get();
      usersSnap.forEach( doc => {
        var userRef = firestore.collection("users").doc(doc.id);
        const userData = doc.data();
        console.log(userData.first_name);

        userRef.update({
             sec_roles: [...userData.sec_roles, ...secRoles]
        })
        .then( res => {
          console.log(res);
        })

      });

  });

  await Promise.all(promises);
  console.log('Promises resolved');

};

fs.createReadStream(inputFile)
.pipe(parser);
