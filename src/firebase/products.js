import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";

const COL = "products";

// ─── Schema الجديد للصور المتعددة ──────────────────────────────────────────
// {
//   id:          string  (auto)
//   nameAr:      string
//   nameEn:      string
//   descAr:      string
//   descEn:      string
//   price:       number  (EGP)
//   category:    "gifts" | "scented" | "decorative" | "body"
//   images:      [ { url: string, path: string }, { url: string, path: string }, ... ] <-- مصفوفة الصور
//   stock:       number
//   isNew:       boolean
//   isBestSeller:boolean
//   createdAt:   timestamp
//   updatedAt:   timestamp
// }

// ─── رفع مجموعة من الصور معاً إلى Storage ──────────────────────────────────
export const uploadProductImages = async (files, productId) => {
  const uploadedImages = [];
  
  // تحويل الـ FileList إلى Array واللف عليها لرفعها صورة صورة
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `products/${productId}/${Date.now()}_${i}`;
    const storageRef = ref(storage, path);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    uploadedImages.push({ url, path });
  }
  
  return uploadedImages; // هترجع Array فيها الـ url والـ path لكل صورة
};

// ─── حذف مجموعة من الصور من Storage ────────────────────────────────────────
export const deleteProductImages = async (imagesArray) => {
  if (!imagesArray || !Array.isArray(imagesArray)) return;
  
  const deletePromises = imagesArray.map((img) => {
    if (img.path) {
      const storageRef = ref(storage, img.path);
      return deleteObject(storageRef).catch(() => {});
    }
    return Promise.resolve();
  });
  
  await Promise.all(deletePromises);
};

// ─── Add product ────────────────────────────────────────────────────────────
export const addProduct = async (data) => {
  return await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// ─── Update product ─────────────────────────────────────────────────────────
export const updateProduct = async (id, data) => {
  const productRef = doc(db, COL, id);
  return await updateDoc(productRef, { ...data, updatedAt: serverTimestamp() });
};

// ─── Delete product ─────────────────────────────────────────────────────────
export const deleteProduct = async (id, imagesArray) => {
  await deleteProductImages(imagesArray);
  return await deleteDoc(doc(db, COL, id));
};

// ─── Get single product (one-time) ─────────────────────────────────────────
export const getProduct = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Get all products (one-time) ────────────────────────────────────────────
export const getAllProducts = async () => {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── Real-time listener — all products ──────────────────────────────────────
export const subscribeToProducts = (callback) => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── Real-time listener — by category ───────────────────────────────────────
export const subscribeToCategory = (category, callback) => {
  const q = query(
    collection(db, COL),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── Real-time listener — best sellers ──────────────────────────────────────
export const subscribeToBestSellers = (callback) => {
  const q = query(collection(db, COL), where("isBestSeller", "==", true));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── Real-time listener — new arrivals ──────────────────────────────────────
export const subscribeToNewArrivals = (callback) => {
  const q = query(collection(db, COL), where("isNew", "==", true));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};