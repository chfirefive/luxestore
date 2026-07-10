"use client";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Same config as server init
const firebaseConfig = {
  apiKey: "AIzaSyAwGvla8MDQHMsgjjGll2aPnZKN8aG287A",
  authDomain: "luxestore-space.firebaseapp.com",
  projectId: "luxestore-space",
  storageBucket: "luxestore-space.firebasestorage.app",
  messagingSenderId: "8375849730",
  appId: "1:8375849730:web:8b0bfaf34b0c8e35f9681b",
  measurementId: "G-2TKSSL1W43"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Client‑side Firestore instance for reads in client components
const db = getFirestore(app);

export { auth, db };
