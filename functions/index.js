const functions = require('firebase-functions');
require('firebase/firestore');

const admin = require('firebase-admin');
const moment = require('moment');

admin.initializeApp();
const firestore = admin.firestore();

const express = require('express');
const cookieParser = require('cookie-parser')();
var bodyParser = require('body-parser');
const cors = require('cors')({origin: true});

const app = express();
app.use(cors);
app.use(bodyParser.json()); // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/groups', (req, res) => {
  return getGroups(req, res)
  .then( groups => {
    return res.send(groups);
  });
});

app.get('/units', (req, res) => {
  return getUnits(req, res);
})

app.post('/pupil', (req, res) => {

  res.set({
    'Content-Type': 'application/json'
  })

  if( !req.is('application/json') ) {
    return res.status(406) //Not Acceptable
           .send(`Content-Type header ${req.headers[content-type]} is not supported`)
  }

  var groupSymbol = req.body.groupSymbol;
  var secret = req.query.secret;

  if( secret == 'undefined' ) {
    return res.status(401)
           .json({
             errorCode: 401,
             errorMessage: `Not authorized. Provide 'secret' parameter in url`
           })
  }
  if( secret !== 'Day1!') {
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

  // format date to unix epoch milliseconds in order to comply
  // with Firebase 'timestamp' type
  var when = moment(req.body.whenRegistered, "DD/MM/YYYY");
  var pupil = {
    name: req.body.name,
    address: req.body.address,
    whenRegistred: new Date(when.valueOf()) // valueOf() is actually unix() * 1000
  }

  return getGroups(req, res)
  .then( groups => {

    var _group = groups.find( group => {
      return group.symbol === groupSymbol
    });

    if( !_group ) {

      return res.status(404)
            .json({
              errorCode: 404,
              errorMessage: `No group identified by symbol '${req.body.groupSymbol}' was found`
            });

    } else {

      //console.log(`Found group: id: ${_group.id} unitId: ${_group.unitId}`);

      return {
        groupdId: _group.id,
        unitId: _group.unitId
      }
    }
  })
  .then( groupParams => {

    return firestore.collection('units/' + groupParams.unitId + '/groups/' + groupParams.groupdId + '/pupils/')

  })
  .then( pupilsCollectionRef => {

    return pupilsCollectionRef.add(pupil);

  })
  .then( ref => {

    return res.status(200).json({
      id: ref.id
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

              _groups.push({
                unitId: unitId,
                id: doc.id,
                symbol: groupData.symbol,
                opened: moment(groupData.opened).format('DD/MM/YYYY')
              });

            });

          });

          return _groups;
      })
}
