// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBi6dDVS7vnmcTPppuU6R97bGo9h9EYkOQ",
    authDomain: "notes-app-6c510.firebaseapp.com",
    databaseURL: "https://notes-app-6c510.firebaseio.com",
    projectId: "notes-app-6c510",
    storageBucket: "notes-app-6c510.appspot.com",
    messagingSenderId: "87481295381",
    appId: "1:87481295381:web:1310113e391b0e7dca241c",
    measurementId: "G-NXYKYDMS29"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.enablePersistence().catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
        console.log('failed');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
        console.log('persistance isnt available');
    }
});

function createDb(userId) {
    return db.collection('users').doc(userId).collection('notes');
}