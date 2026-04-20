// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFHy2TFa9rDPdVzwdSxpNrAmmFjzY7XvE",
  authDomain: "logistics-dri.firebaseapp.com",
  projectId: "logistics-dri",
  storageBucket: "logistics-dri.firebasestorage.app",
  messagingSenderId: "552515162391",
  appId: "1:552515162391:web:ad22400f839f59107de752",
  measurementId: "G-QJXH0F79XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);