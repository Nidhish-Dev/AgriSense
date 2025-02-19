// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbn6owGOsP47NnznostiiBoBWgc2ri7lI",
  authDomain: "test-b67c6.firebaseapp.com",
  databaseURL: "https://test-b67c6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-b67c6",
  storageBucket: "test-b67c6.firebasestorage.app",
  messagingSenderId: "476186915117",
  appId: "1:476186915117:web:83d4a6fdfb5adfdb9763a4",
  measurementId: "G-EM643YLV4N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database, ref, get };
