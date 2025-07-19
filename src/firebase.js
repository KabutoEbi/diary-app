import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD92SXvuZuJ9y9VVEj_p06uWGtYjBratUM",
  authDomain: "diary-app-2ed15.firebaseapp.com",
  projectId: "diary-app-2ed15",
  storageBucket: "diary-app-2ed15.appspot.com",
  messagingSenderId: "834705668218",
  appId: "1:834705668218:web:ff52e564c8a18583dd63c3",
  measurementId: "G-MQCMB5FQDV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };