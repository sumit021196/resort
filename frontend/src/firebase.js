// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkyakyGiyQEtDMstw-6pUQLVJz0FUJvps",
  authDomain: "resortvegetableinventory.firebaseapp.com",
  projectId: "resortvegetableinventory",
  storageBucket: "resortvegetableinventory.firebasestorage.app",
  messagingSenderId: "555546281878",
  appId: "1:555546281878:web:f80d38daf21e3d49bd7fb7",
  measurementId: "G-XBEZ6Y4CDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// If you want to use Analytics, you can uncomment the following lines
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

export { db, auth, app };
