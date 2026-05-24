import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, addDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";

// ─── إدارة الفئات الجديدة (Categories) ───────────────────────────────────────
export const uploadCategoryImage = async (file, categoryId) => {
  const path = `categories/${categoryId}_${Date.now()}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

export const addCategory = async (data) => {
  return await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateCategory = async (id, data) => {
  return await updateDoc(doc(db, "categories", id), data);
};

export const deleteCategory = async (id, imagePath) => {
  if (imagePath) {
    await deleteObject(ref(storage, imagePath)).catch(() => {});
  }
  return await deleteDoc(doc(db, "categories", id));
};

export const subscribeToCategories = (callback) => {
  const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── الدوال القديمة والمستقرة لصور الموقع والإعدادات ──────────────────────────
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

export const uploadBannerImage = async (file) => {
  const path = `banners/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

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

export const deleteBanner = async (id, imagePath) => {
  if (imagePath) {
    await deleteObject(ref(storage, imagePath)).catch(() => {});
  }
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

export const validatePromoCode = async (code) => {
  const snap = await getDoc(doc(db, "promoCodes", code.toUpperCase()));
  if (!snap.exists()) return { valid: false, message: "Invalid promo code" };
  const data = snap.data();
  if (!data.active) return { valid: false, message: "Promo code is inactive" };
  if (data.expiresAt && data.expiresAt.toDate() < new Date())
    return { valid: false, message: "Promo code has expired" };
  if (data.usedCount >= data.maxUses)
    return { valid: false, message: "Promo code has been fully used" };
  return { valid: true, discount: data.discount };
};

export const usePromoCode = async (code) => {
  const ref = doc(db, "promoCodes", code.toUpperCase());
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { usedCount: (snap.data().usedCount || 0) + 1 });
  }
};