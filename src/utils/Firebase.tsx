import * as firebase from 'firebase';
import { getTimeStamp } from './timestamp';

const doLogging = false;

function getChannelName(): string {
    const url = window.location.href;
    const reg = /\/c\/(.*)\//g
    const match = reg.exec(url);
    if(match) { return match[1]; }
    else { return "NaN" }
}

// export let analytics: firebase.analytics.Analytics|null = null;

const firebaseConfig = {
    apiKey: "AIzaSyCSzvVwCpFS3zVipQ7qso_Cxaa9HTolLBk",
    authDomain: "puzzlemi-log2.firebaseapp.com",
    databaseURL: "https://puzzlemi-log2.firebaseio.com",
    projectId: "puzzlemi-log2",
    storageBucket: "puzzlemi-log2.appspot.com",
    messagingSenderId: "2360208709",
    appId: "1:2360208709:web:550b4bed983f1af10f622c",
    measurementId: "G-YMDRC9GJFS"
};
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

export const logEvent: (eventName: string, parameters: {[key: string]: any}, problemID?: string, userID?: string) => void = doLogging ?
    (eventname, parameters, problemid, userid) => {
        database.ref('events/').push({
        eventname,
        timestamp: getTimeStamp(),
        userid,
        problemid,
        channel: getChannelName(),
        url: window.location.href, 
        parameters,
        });
    } :
    (eventName, parameters, problemID, userID) => {};

export const analytics: firebase.analytics.Analytics = firebase.analytics();