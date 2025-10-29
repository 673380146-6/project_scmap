// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmNqCoTGvXXLsMg4-EBG4u8Znj6ytJ6UE",
  authDomain: "cp422021-491.firebaseapp.com",
  databaseURL: "https://cp422021-491-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cp422021-491",
  storageBucket: "cp422021-491.firebasestorage.app",
  messagingSenderId: "960977915146",
  appId: "1:960977915146:web:ddf1edddccfcebc829fef3",
  measurementId: "G-YW31M8LYMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Export the services
export { auth, db, storage };