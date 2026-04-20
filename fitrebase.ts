// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxo8W46mWLO9xhLkn_a1DKQCqAFkBv-lE",
  authDomain: "logistics-69f96.firebaseapp.com",
  projectId: "logistics-69f96",
  storageBucket: "logistics-69f96.firebasestorage.app",
  messagingSenderId: "986510137107",
  appId: "1:986510137107:web:f1047ba5021cc1aad92ce6",
  measurementId: "G-1QHKSVY6S9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);