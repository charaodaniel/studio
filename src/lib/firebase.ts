// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlxcX0nqztII1fHvJ8kkbcRONOPlaWLcE",
  authDomain: "ridelink-b5m8r.firebaseapp.com",
  projectId: "ridelink-b5m8r",
  storageBucket: "ridelink-b5m8r.appspot.com",
  messagingSenderId: "651845572978",
  appId: "1:651845572978:web:b20c854e206a3eaad965eb"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
