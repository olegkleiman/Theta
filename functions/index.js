// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
require('firebase/firestore');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
//const firebase = require('./firebase.js');

const moment = require('moment');

admin.initializeApp();
const firestore = admin.firestore();
// const settings = {
//   timestampsInSnapshots: true
// };
// firestore.settings(settings);

exports.groups = functions.https.onRequest((req, res) => {

  console.log(req.method);

  return firestore.collection('units')
    .get()
    .then( response => {

      const _units = [];

      response.docs.forEach( (unit) => {
        const unitId = unit.id;
        _units.push(unitId);
      });

      return _units;

    })
    .then( unitIds => {

      var _promises = [];

      unitIds.forEach( unitId => {
          var _promise = firestore.collection('units/' + unitId + '/groups')
                        .get();
          _promises.push(_promise);
      })

      return Promise.all(_promises)
      .then( (items) => {

        const _groups = [];

        items.forEach( item => {

          item.docs.forEach( doc => {
            const groupData = doc.data();
            //console.log(moment(groupData.opened).format('DD/MM/YYYY'));
            _groups.push({
              symbol: groupData.symbol,
              opened: moment(groupData.opened).format('DD/MM/YYYY')
            });

          });

        });

        return res.send(_groups);
      })
    });

});

exports.units = functions.https.onRequest((req, res) => {

  return firestore.collection('units')
    .get()
    .then( response => {

      const _units = [];

      response.docs.forEach( (unit) => {

          const unitData = unit.data();

          _units.push({
            name: unitData.name_he,
            concessionaire: unitData.concessionaire,
            symbol: unitData.symbol,
            id: unit.id
          });

      });
      return res.send(_units);
    });

});
