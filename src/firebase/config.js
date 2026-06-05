import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"; // غيرنا الاستدعاء هنا
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

// التعديل السحري: بنجبر الفايربيز يتواصل كـ HTTP عادي (Long Polling) عشان نتجنب البلوك والوهم بتاع الذاكرة المؤقتة
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;