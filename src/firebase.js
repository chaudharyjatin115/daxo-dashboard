

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyAQTAMquA2YMLpdTmpy9Pp2RJ0xsS4z0oA",
  authDomain: "daxo-dashboard-9945c.firebaseapp.com",
  projectId: "daxo-dashboard-9945c",
  messagingSenderId: "95184496902",
  appId: "1:95184496902:web:3b280ee5ae489c03629687",
};

/* initialize app */
const app = initializeApp(firebaseConfig);

/* services */
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;