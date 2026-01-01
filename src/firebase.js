import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/*
  firebase config
  - make sure these values match the SAME firebase project
  - authorized domains must be added in firebase console
*/
const firebaseConfig = {
  apiKey: "AIzaSyAQTAMquA2YMLpdTmpy9Pp2RJ0xsS4z0oA",
  authDomain: "daxo-dashboard-9945c.firebaseapp.com",
  projectId: "daxo-dashboard-9945c",
  storageBucket: "daxo-dashboard-9945c.appspot.com",
  messagingSenderId: "95184496902",
  appId: "1:95184496902:web:3b280ee5ae489c03629687",
};

/* initialize app ONCE */
const app = initializeApp(firebaseConfig);

/* firebase services */
export const auth = getAuth(app);
export const db = getFirestore(app);