import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC5aJb8oANcW39HeviLs-z4mIww3aDZj38",
  authDomain: "lemo-store-1086f.firebaseapp.com",
  projectId: "lemo-store-1086f",
  storageBucket: "lemo-store-1086f.firebasestorage.app",
  messagingSenderId: "1020189997312",
  appId: "1:1020189997312:web:0ac53479bfef3227c19be5",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;