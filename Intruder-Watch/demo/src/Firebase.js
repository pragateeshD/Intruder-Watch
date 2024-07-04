import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBrHI3t6d85lUhXrdQZcVpfYUImilUW-7o",
    authDomain: "fir-react-auth-f2a1e.firebaseapp.com",
    projectId: "fir-react-auth-f2a1e",
    storageBucket: "fir-react-auth-f2a1e.appspot.com",
    messagingSenderId: "939982276450",
    appId: "1:939982276450:web:1b29374b89a5f879c8ce3b",
    measurementId: "G-YRC4FHD8GD"
  };
  
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var provider = new firebase.auth.GoogleAuthProvider(); 
export {auth , provider};
export default firebase;
