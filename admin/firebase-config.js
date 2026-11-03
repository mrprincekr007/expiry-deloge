var firebaseConfig = {
    apiKey: "AIzaSyCphT3GQWxbyVdGeRSPWhCnn3n1QD3tJR8",
    authDomain: "prince-hacks-website.firebaseapp.com",
    databaseURL: "https://prince-hacks-website-default-rtdb.firebaseio.com",
    projectId: "prince-hacks-website",
    storageBucket: "prince-hacks-website.firebasestorage.app",
    messagingSenderId: "1035319104923",
    appId: "1:1035319104923:web:26c7c175757aebef86fd3e"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();
if (typeof firebase.auth === 'function') { var auth = firebase.auth(); }
