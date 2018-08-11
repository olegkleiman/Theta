const functions = require('firebase-functions');
require('firebase/firestore');

const admin = require('firebase-admin');
const moment = require('moment');
var Validator = require('jsonschema').Validator;

admin.initializeApp();
const firestore = admin.firestore();

const express = require('express');
const cookieParser = require('cookie-parser')();
var bodyParser = require('body-parser');
const cors = require('cors')({origin: true});

const app = express();
app.use(cors);
 // Enforces 406 (Not Acceptable) for Content-Type different from 'application-json'
app.use(bodyParser.json({
  strict:false
}));

// Uncomment for parsing application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }));

app.get('/groups', (req, res) => {
  return getGroups(req, res)
  .then( groups => {
    return res.send(groups);
  });
});

app.get('/group', (req, res) => {

  const groupSymbol = req.query.symbol;

  return getGroups(req, res)
  .then( groups => {

    const group = groups.find( group => {
      return group.symbol === groupSymbol
    });

    return res.send(group);
  })

});

app.get('/units', (req, res) => {
  return getUnits(req, res);
})

app.post('/pupil', (req, res) => {

  if( !req.is('application/json') ) {
    var header = JSON.stringify(req.headers['content-type']);
    console.log(`Incoming header: ${header}`);
    return res.status(406) //Not Acceptable
           .send(`Content-Type header ${header} is not supported`);
  }

  res.set({
    'Content-Type': 'application/json'
  });

  var groupSymbol = req.body.groupSymbol;
  var secret = req.query.secret;

  if( secret == 'undefined' ) {
    return res.status(401)
           .json({
             errorCode: 401,
             errorMessage: `Not authorized. Provide 'secret' parameter in url`
           })
  }
  if( secret !== 'Day1!' && secret !== 'Ep$ilon' ) {
    return res.status(401)
           .json({
             errorCode: 401,
             errorMessage: `Not authorized. 'secret' parameter is not valid`
           })
  }

  if( !groupSymbol ) {
    return res.status(200)
    .json({
      errorCode: 3,
      errorMessage: `Can't find expected parameter - groupSymbol - in request body`
    })
  }

  const schema = {
    "groupSymbol": "string",
    "name": "string",
    "family": "string",
    "pupilId": "string",
    "parentId": "string",
    "phoneNumber": "number",
    "paymentApprovalNumber": "string",
    "medicalLimitations": "boolean",
    "whenRegistered": "date"
  };
  const v = new Validator();
  console.log(`Validation: ${v.validate(req.body, schema).valid}`);

  // format date to unix epoch milliseconds in order to comply
  // with Firebase 'timestamp' type
  const birthDay = moment(req.body.DateOfBirth, "DD-MM-YYYY HH:mm:ss");
  const when = moment(req.body.whenRegistered, "DD-MM-YYYY HH:mm:ss");
  const pupil = {
    name: req.body.name,
    lastName: req.body.family,
    pupilId: ( req.body.pupilId ) ? req.body.pupilId : '',
    address: ( req.body.address ) ? req.body.address : '',
    birthDay: new Date(birthDay.valueOf()),
    parentId: (req.body.parentId) ? req.body.parentId : '',
    paymentApprovalNumber: (req.body.PaymentConfirmationNumber) ?
        req.body.PaymentConfirmationNumber : '',
    payerName: ( req.body.name_pay ) ? req.body.name_pay : '',
    status: ( req.body.status ) ? req.body.status : '',
    registrationSource: ( req.body.registration_source ) ? req.body.registration_source : '',
    phoneNumber: req.body.phoneNumber,
    medicalLimitations: req.body.medicalLimitations ? req.body.medicalLimitations : true,
    whenRegistered: new Date(when.valueOf()) // valueOf() is actually unix() * 1000
  }

  return getGroups(req, res)
  .then( groups => {

    const _group = groups.find( group => {
      return group.symbol === groupSymbol
    });

    if( !_group ) {

      // This will bw catched at the end of promises chain
      throw new Error(`No group identified by symbol '${req.body.groupSymbol}' was found`);

    } else {

      //console.log(`Found group: id: ${_group.id} unitId: ${_group.unitId}`);

      return {
        groupdId: _group.id,
        unitId: _group.unitId
      }
    }
  })
  .then( groupParams => {

    console.log(`Processing group ${groupParams}`);

    return firestore.collection('units/' + groupParams.unitId + '/groups/' + groupParams.groupdId + '/pupils/')

  })
  .then( pupilsCollectionRef => {

    return pupilsCollectionRef.add(pupil);

  })
  .then( ref => {

    return res.status(200).json({
      id: ref.id
    });

  })
  .catch( err => {

    //console.log(`Catched ${err.message}`);
    return res.status(200)
          .json({
              errorCode: 2,
              errorMessage: err.message
            });

  });

});

exports.api = functions.https.onRequest(app);

exports.groups = functions.https.onRequest((req, res) => {

  var method = req.method;
  if( method === 'GET') {

    return getGroups(req, res)
    .then( groups => {
      return res.send(groups);
    });

  } else {

    return res.status(404).send(`Cannot ${method}`)
  }

});

exports.units = functions.https.onRequest((req, res) => {
  var method = req.method;
  if( method === 'GET') {

    return getUnits(req, res);

  } else {

    return res.status(404).send(`Cannot ${method}`)

  }

});

exports.unregisterPupil  = functions.firestore
    .document('units/{unitId}/groups/{groupId}/pupils/{pupilId}')
    .onDelete((snap, context) => {

      console.log('onDelete');

      const doc = firestore.doc(`units/${context.params.unitId}/groups/${context.params.groupId}`);
      doc.get()
      .then( _doc => {
         const docData = _doc.data();

         doc.update({
           registeredPupils: docData.registeredPupils - 1
         })
      })

      return true;

    })

exports.registerPupil = functions.firestore
  .document('units/{unitId}/groups/{groupId}/pupils/{pupilId}')
  .onCreate( (snap, context) => {
     //const newDoc = snap.data();

     // console.log(`UnitId: ${context.params.unitId}`);
     // console.log(`GroupId: ${context.params.groupId}`);
     console.log(`onCreate PupilId: ${context.params.pupilId}`);

     const doc = firestore.doc(`units/${context.params.unitId}/groups/${context.params.groupId}`);
     doc.get()
     .then( _doc => {
        const docData = _doc.data();

        console.log(`Prev. counter: ${docData.registeredPupils}`);

        return doc.update({
          registeredPupils: docData.registeredPupils + 1
        })
     })
     .then( res => {
       console.log(`Update result: ${res}`);
     })

     return true;
  })

function getUnits(req, res) {

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
}

function getGroups(req, res) {

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

      })
      .then( groupDocs => {

          const _groups = [];

          groupDocs.forEach( groupDoc => {

            groupDoc.docs.forEach( doc => {

              // This document (doc.ref) belongs to 'groups' collection (doc.ref.parent)
              // that, in turn, has a patent - a 'units' collection (doc.ref.parent.parent).
              // We're interesting it this grandparent's id
              var unitId = doc.ref.parent.parent.id;
              const groupData = doc.data();

              //console.log(JSON.stringify(groupData));

              _groups.push({
                unitId: unitId,
                id: doc.id,
                symbol: groupData.symbol,
                name: groupData.name,
                openFrom: moment(groupData.openFrom).format('DD/MM/YYYY'),
                openTill: moment(groupData.openTill).format('DD/MM/YYYY'),
                price: groupData.price,
                capacity: groupData.capacity
                //unitName: groupData.unit.name_he
              });

            });

          });

          return _groups;
      })
}
