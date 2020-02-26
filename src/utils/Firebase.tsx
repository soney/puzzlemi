import * as firebase from 'firebase';

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
export const analytics = firebase.analytics();