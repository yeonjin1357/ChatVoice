// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDiCvOyFDK1iLcPwHdfgbPfi7psoTG0BAg",
  authDomain: "minji-e82e9.firebaseapp.com",
  projectId: "minji-e82e9",
  storageBucket: "minji-e82e9.appspot.com",
  messagingSenderId: "138324012725",
  appId: "1:138324012725:web:9459103f4979268a4098fc",
  measurementId: "G-2ZJCHLT4ZS",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
