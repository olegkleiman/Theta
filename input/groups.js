var fs = require('fs');
const readline = require('readline');
var parse = require('csv-parse');
require('firebase/firestore');
import * as admin from 'firebase-admin';
var serviceAccount = require("./theta-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://theta-1524876066401.firebaseio.com"
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

  let units = data.map( async(row,index) => {

    let symbol = row[3];
    if( index !== 0 && symbol != '' ) {

      if( symbol.indexOf('-') !== -1 ) {
        symbol = symbol.replace('-', '');
      }

      console.log(`Index: ${index}. Data: ${row}`);
      const sec_role = 'unit_' + row[3];
      console.log(`Symbol ${symbol}. Sec Role: ${sec_role}`);

      const res = await firestore.collection('units')
                  .where('symbol', '=', symbol)
                  .get();
      console.log(res);

      return res;
    }

  });

  units = units.filter( r => r); // remove nulls

  units.forEach( unit => {
    console.log(unit);
  });

});

fs.createReadStream(inputFile)
.pipe(parser);
