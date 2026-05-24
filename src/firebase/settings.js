import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, addDoc, deleteDoc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";

// ─── Get settings (one-time) ────────────────────────────────────────────────
export const getSettings = async () => {
  const snap = await getDoc(doc(db, "settings", "main"));
  return snap.exists() ? snap.data() : {};
};

// ─── Update settings ────────────────────────────────────────────────────────
export const updateSettings = async (data) => {
  return await setDoc(doc(db, "settings", "main"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ─── Real-time settings listener ─────────────────────────────────────────────
export const subscribeToSettings = (callback) => {
  return onSnapshot(doc(db, "settings", "main"), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
};

// ─── Upload banner image ─────────────────────────────────────────────────────
export const uploadBannerImage = async (file) => {
  const path = `banners/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

// ─── Add banner ──────────────────────────────────────────────────────────────
export const addBanner = async (data) => {
  return await addDoc(collection(db, "banners"), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
};

// ─── Update banner ───────────────────────────────────────────────────────────
export const updateBanner = async (id, data) => {
  return await updateDoc(doc(db, "banners", id), data);
};

// ─── Delete banner ───────────────────────────────────────────────────────────
export const deleteBanner = async (id, imagePath) => {
  if (imagePath) {
    await deleteObject(ref(storage, imagePath)).catch(() => {});
  }
  return await deleteDoc(doc(db, "banners", id));
};

// ─── Real-time banners listener ──────────────────────────────────────────────
export const subscribeToBanners = (callback) => {
  return onSnapshot(collection(db, "banners"), (snap) => {
    const banners = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((b) => b.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(banners);
  });
};

// ─── Validate promo code ─────────────────────────────────────────────────────
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

// ─── Increment promo code usage ──────────────────────────────────────────────
export const usePromoCode = async (code) => {
  const ref = doc(db, "promoCodes", code.toUpperCase());
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { usedCount: (snap.data().usedCount || 0) + 1 });
  }
};