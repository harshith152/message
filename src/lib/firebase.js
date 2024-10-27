// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-af22e.firebaseapp.com",
  projectId: "reactchat-af22e",
  storageBucket: "reactchat-af22e.appspot.com",
  messagingSenderId: "78216125026",
  appId: "1:78216125026:web:97cf8acf5c3b0be303cf3b"
};


const app = initializeApp(firebaseConfig);

export const auth =getAuth()
export const db = getFirestore()
export const storage = getStorage()


