import {
  doc, setDoc, updateDoc, onSnapshot,
  collection, addDoc, deleteDoc, getDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const CLOUDINARY_CLOUD = "dakjxjp0l";
const CLOUDINARY_PRESET = "yhabgqv3";

export const uploadBannerImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return { url: data.secure_url, path: data.public_id };
};

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