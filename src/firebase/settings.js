import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, addDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "./config";

// ─── إدارة الإعدادات العامة للمتجر ──────────────────────────────────────────
export const getSettings = async () => {
  const snap = await getDoc(doc(db, "settings", "main"));
  return snap.exists() ? snap.data() : {};
};

export const updateSettings = async (data) => {
  return await setDoc(doc(db, "settings", "main"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const subscribeToSettings = (callback) => {
  return onSnapshot(doc(db, "settings", "main"), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
};

// ─── إدارة الفئات المستقرة بنسبة 100% ──────────────────────────────────────────
export const addCategory = async (data) => {
  return await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateCategory = async (id, data) => {
  const docRef = doc(db, "categories", id);
  return await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteCategory = async (id) => {
  return await deleteDoc(doc(db, "categories", id));
};

export const subscribeToCategories = (callback) => {
  const q = query(collection(db, "categories"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── إدارة البنرات وصور الموقع العامة ───────────────────────────
export const addBanner = async (data) => {
  return await addDoc(collection(db, "banners"), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
};

export const updateBanner = async (id, data) => {
  return await updateDoc(doc(db, "banners", id), data);
};

export const deleteBanner = async (id) => {
  return await deleteDoc(doc(db, "banners", id));
};

export const subscribeToBanners = (callback) => {
  return onSnapshot(collection(db, "banners"), (snap) => {
    const banners = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((b) => b.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(banners);
  });
};

// ─── كود البرومو كود التسويقي المستقر ────────────────────────────────────────
export const validatePromoCode = async (code) => {
  const snap = await getDoc(doc(db, "promoCodes", code.toUpperCase()));
  if (!snap.exists()) return { valid: false, message: "Invalid promo code" };
  const data = snap.data();
  if (!data.active) return { valid: false, message: "Promo code is inactive" };
  return { valid: true, discount: data.discount };
};

export const usePromoCode = async (code) => {
  const ref = doc(db, "promoCodes", code.toUpperCase());
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { usedCount: (snap.data().usedCount || 0) + 1 });
  }
};