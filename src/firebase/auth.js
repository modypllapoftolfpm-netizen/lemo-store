import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider, // 👈 استيراد جوجل
  signInWithPopup     // 👈 استيراد نافذة الدخول
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const ADMIN_EMAIL = "admin@lemostore.com";

// تجهيز مزود خدمة جوجل
const googleProvider = new GoogleAuthProvider();

// ─── تسجيل الدخول العادي (إيميل وباسورد) ───────────────────────────────────
export const signUp = async ({ name, email, password, phone }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    phone: phone || "",
    role: email === ADMIN_EMAIL ? "admin" : "user",
    createdAt: serverTimestamp(),
  });
  return user;
};

export const signIn = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

// ─── الدخول باستخدام جوجل (الجديد) ─────────────────────────────────────────
export const loginWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    
    // فحص: هل العميل ده دخل قبل كده، ولا دي أول مرة؟
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    // لو أول مرة يدخل بجوجل، ننشئ له ملف في قاعدة البيانات
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName || "عميل جوجل",
        email: user.email,
        phone: user.phoneNumber || "",
        role: user.email === ADMIN_EMAIL ? "admin" : "user",
        createdAt: serverTimestamp(),
      });
    }

    console.log("✅ تم الدخول بجوجل بنجاح:", user.displayName);
    return user;
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول بجوجل:", error.message);
    throw error;
  }
};

// ─── باقي دوال النظام ───────────────────────────────────────────────────────
export const logOut = () => signOut(auth);

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  return await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);