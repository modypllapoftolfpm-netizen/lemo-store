import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COL = "products";

// 🔴🔴 بيانات Cloudinary الخاصة بك 🔴🔴
const CLOUDINARY_CLOUD_NAME = "dakjxjp0l"; 
const CLOUDINARY_UPLOAD_PRESET = "lemo_store"; 

// ─── دالة رفع صور متعددة (Cloudinary) ──────────────────────────
export const uploadMultipleImages = async (files, productId) => {
  const urls = [];
  const paths = []; 
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    // إرسال الصورة لـ Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("فشل رفع الصورة على Cloudinary، تأكد من اسم الكلاود والـ Preset.");
    }

    const data = await response.json();
    urls.push(data.secure_url); // رابط الصورة المباشر
    paths.push(data.public_id); // الـ ID بتاع الصورة في كلاوديناري
  }
  return { urls, paths };
};

// ─── دالة حذف الصور (معدلة للأمان) ───────────────────────────────────────
export const deleteProductImages = async (imagePaths) => {
  // Cloudinary يمنع حذف الصور من واجهة المستخدم (الفرونت إند) لدواعي أمنية
  // تم تعطيل كود الحذف هنا حتى لا يحدث خطأ عند حذف المنتج.
  // سيتم مسح بيانات المنتج من الموقع، والصورة تظل في Cloudinary كأرشيف.
  console.log("تم تخطي الحذف من Cloudinary للأمان. الـ IDs:", imagePaths);
  return Promise.resolve();
};

// ─── الدوال الأساسية للمنتجات ───────────────────────────────────────────────
export const addProduct = async (data) => {
  return await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id, data) => {
  const ref = doc(db, COL, id);
  return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id, imagePaths) => {
  await deleteProductImages(imagePaths);
  return await deleteDoc(doc(db, COL, id));
};

export const getProduct = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── باقي دوال الجلب والـ Listeners للموقع ──────────────────────────────────
export const getAllProducts = async () => {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToProducts = (callback) => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const subscribeToCategory = (category, callback) => {
  const q = query(collection(db, COL), where("category", "==", category), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const subscribeToBestSellers = (callback) => {
  const q = query(collection(db, COL), where("isBestSeller", "==", true));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const subscribeToNewArrivals = (callback) => {
  const q = query(collection(db, COL), where("isNew", "==", true));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};