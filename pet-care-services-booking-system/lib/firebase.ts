import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlDu0atyP7AWdKJ4-BO-wXyIl2yHZqexg",
  authDomain: "pet-services-booking-system.firebaseapp.com",
  projectId: "pet-services-booking-system",
  storageBucket: "pet-services-booking-system.firebasestorage.app",
  messagingSenderId: "468584453249",
  appId: "1:468584453249:web:fef420ec57e8f2377d6980",
  measurementId: "G-3N1TZBBQ9K"
};

// Initialize Firebase app once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
