import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const ADMIN_EMAIL = "admin@lemostore.com";

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