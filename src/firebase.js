const app = initializeApp(firebaseConfig);import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQTAMquA2YMLpdTmpy9Pp2RJ0xsS4z0oA",
  authDomain: "daxo-dashboard-9945c.firebaseapp.com",
  projectId: "daxo-dashboard-9945c",
  storageBucket: "daxo-dashboard-9945c.firebasestorage.app",
  messagingSenderId: "95184496902",
  appId: "1:95184496902:web:3b280ee5ae489c03629687"
};


export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;