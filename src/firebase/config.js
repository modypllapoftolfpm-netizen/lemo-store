import { initializeApp } from "firebase/app";
// استيراد النسخة العادية (للإدمن وباقي الموقع)
import { getFirestore as getFirestoreStandard } from "firebase/firestore"; 
// استيراد النسخة الـ Lite (للطلبات فقط لضمان الإرسال المباشر)
import { getFirestore as getFirestoreLite } from "firebase/firestore/lite"; 
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

// 1. db العادية لباقي الموقع (المنتجات، الإدمن، إلخ)
export const db = getFirestoreStandard(app);

// 2. dbLite للطلبات فقط (عشان نضمن وصولها للسيرفر بعيداً عن حظر الشركات)
export const dbLite = getFirestoreLite(app);

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;