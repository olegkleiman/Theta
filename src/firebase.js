import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';

var config = {
  apiKey: "AIzaSyDi0kLfYSZ9ofQCNDdT9QZWwJfgdth8SR4",
  authDomain: "theta-1524876066401.firebaseapp.com",
  databaseURL: "https://theta-1524876066401.firebaseio.com",
  projectId: "theta-1524876066401",
  storageBucket: "theta-1524876066401.appspot.com",
  messagingSenderId: "110875185211"
};

const firebaseApp = firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};
firestore.settings(settings);

export default firebaseApp;
