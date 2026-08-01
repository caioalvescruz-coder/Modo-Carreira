import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "carreira-ea-fc-f0aa6",
  appId: "1:67238945054:web:ebd9fe973a2068ef1da90f",
  storageBucket: "carreira-ea-fc-f0aa6.firebasestorage.app",
  apiKey: "AIzaSyBcyRSxHhsMMUU41p2YIVNRgfhxJolu7gg",
  authDomain: "carreira-ea-fc-f0aa6.firebaseapp.com",
  messagingSenderId: "67238945054",
  measurementId: "G-Z03PW0MWHE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc, getDocs, collection, onSnapshot };
