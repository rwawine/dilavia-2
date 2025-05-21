import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtpxvWXih5ZPRfRMzyGa2PKA0rwc4so48",
  authDomain: "dila-6bad0.firebaseapp.com",
  databaseURL: "https://dila-6bad0-default-rtdb.firebaseio.com",
  projectId: "dila-6bad0",
  storageBucket: "dila-6bad0.appspot.com",
  messagingSenderId: "56204979355",
  appId: "1:56204979355:web:f1b4b0bbcbcb50c8ca6a3e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 