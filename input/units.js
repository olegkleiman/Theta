var fs = require('fs');
const readline = require('readline');
var parse = require('csv-parse');
require('firebase/firestore');
import * as admin from 'firebase-admin';
var serviceAccount = require("./theta-1524876066401-firebase-adminsdk-8cprg-1edd7d9a67.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://theta-1524876066401.firebaseio.com"
});

const firestore = admin.firestore();
var inputFile = 'units.csv'

console.log('Started');

var parser = parse({delimiter: ','}, function (err, data) {

  if( err ) {
    console.log(err);
    return;
  }






  data.forEach( (row, index) => {

    const symbol = row[3];
    if( symbol != '' ) {

      console.log(`Index: ${index}. Data: ${row}`);
      const sec_role = 'unit_' + row[3];
      console.log(sec_role);

      // firestore.collection('units').add({
      //   name_he: row[5],
      //   authority: row[1],
      //   symbol: symbol,
      //   sec_role: 'unit_' + symbol,
      //   education_type: row[6],
      //   type: row[7]
      // })
      //.then( res => {

        firestore.collection('users')
                  .get()
                  .then( snap => {

                    snap.forEach( doc => {
                      var userRef = firestore.collection("users").doc(doc.id);
                      const userData = doc.data();

                      const secRoles = userData.sec_roles;

                      const found  = secRoles.find( role => {
                          return role === sec_role
                      });

                      if( !found ) {

                        secRoles.push(sec_role);
                        console.log(`New roles ${userData.sec_roles}`);

                        userRef.update({
                          sec_roles: secRoles
                        })
                      }
                    })

                  })

      //})
      .catch( err => {
        console.error(err);
      })

    }

  });

});

fs.createReadStream(inputFile).pipe(parser);
