import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, addDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "./config";

// ─── دالة الرفع الحركي على الـ Cloudinary الخاص بحساب محمد ───────────────────────
export const uploadCategoryImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // بنستخدم الـ preset الافتراضي المفتوح للحساب ml_default لضمان الرفع بدون شروط حماية
  formData.append("upload_preset", "ml_default"); 

  const res = await fetch("https://api.cloudinary.com/v1_1/dakjxjp0l/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("فشل رفع الصورة على Cloudinary");
  
  const data = await res.json();
  return { 
    url: data.secure_url, 
    path: data.public_id 
  };
};

// ─── إدارة الفئات في الـ Firestore ──────────────────────────────────────────
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

// ─── إدارَة البنرات وصور الموقع العامة المستقرة ───────────────────────────
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
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");
  
  const res = await fetch("https://api.cloudinary.com/v1_1/dakjxjp0l/image/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return { url: data.secure_url, path: data.public_id };
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

// ─── كود البرومو كود التسويقي المستقر ────────────────────────────────────────
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