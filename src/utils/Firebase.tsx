import * as firebase from 'firebase';
import { getTimeStamp } from './timestamp';
import getChannelName from './channelName';

const firebaseConfig = {
  apiKey: "AIzaSyCzx8LQwyDouWcJi1UdaK2CVbSJiFeOhW8",
  authDomain: "puzzlemi-log.firebaseapp.com",
  databaseURL: "https://puzzlemi-log.firebaseio.com",
  projectId: "puzzlemi-log",
  storageBucket: "puzzlemi-log.appspot.com",
  messagingSenderId: "5171804162",
  appId: "1:5171804162:web:c964421e3a8a72a5c24f1b",
  measurementId: "G-C6ZX5CMK5E"
};
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

export function logEvent(eventname, parameters, problemid, userid) {
  database.ref('events/').push({
    eventname,
    timestamp: getTimeStamp(),
    userid,
    problemid,
    channel: getChannelName(),
    url: window.location.href, 
    parameters,
  });
}

export const analytics = firebase.analytics();