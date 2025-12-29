import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQg_oSG6HGTyG49r3SqOowQbik9-mu-eQ",
  authDomain: "daxo-dashboard.firebaseapp.com",
  projectId: "daxo-dashboard",
  storageBucket: "daxo-dashboard.firebasestorage.app",
  messagingSenderId: "1091453967262",
  appId: "1:1091453967262:web:f440856e853b7753c9948f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);