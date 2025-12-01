// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArg6E2FjS4wH_GcuYr_sCrjAHhpaDxr8Y",
  authDomain: "desenvolvimentoweb-c5c49.firebaseapp.com",
  projectId: "desenvolvimentoweb-c5c49",
  storageBucket: "desenvolvimentoweb-c5c49.firebasestorage.app",
  messagingSenderId: "142267495694",
  appId: "1:142267495694:web:7e434e72100a9b9af9935f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);