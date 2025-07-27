import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmErTjuSwyaiJV3sgq9D9Q5_Bz1lNthg4",
  authDomain: "scps-947f0.firebaseapp.com",
  projectId: "scps-947f0",
  storageBucket: "scps-947f0.firebasestorage.app",
  messagingSenderId: "648366140966",
  appId: "1:648366140966:web:519c68de36e5d05d0100e7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);