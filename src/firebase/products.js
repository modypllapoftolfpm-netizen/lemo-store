import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";

const COL = "products";

// ─── دالة رفع صورة واحدة ──────────────────────────────────────────────────
export const uploadProductImage = async (file, productId) => {
  const path = `products/${productId}_${Date.now()}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

// ─── دالة رفع مصفوفة صور كاملة (ألبوم) بدون أي مكتبات خارجية ─────────────────
export const uploadMultipleImages = async (files, productId) => {
  const urls = [];
  const paths = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `products/${productId}_${Date.now()}_idx_${i}`;
    const storageRef = ref(storage, path);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    urls.push(url);
    paths.push(path);
  }
  
  return { urls, paths };
};

// ─── حذف الصور من الـ Storage بأمان ─────────────────────────────────────────
export const deleteProductImages = async (imagePaths) => {
  if (!imagePaths) return;
  // لو المسارات مصفوفة بنلف عليها، لو نص قديم بنحذفه مباشرة
  const pathsArray = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  
  for (const path of pathsArray) {
    if (path) {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef).catch((err) => console.log("Image delete skipped:", err));
    }
  }
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
  const ref = doc(db, COL, id);
  return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

// ─── Delete product ─────────────────────────────────────────────────────────
export const deleteProduct = async (id, imagePaths) => {
  await deleteProductImages(imagePaths);
  return await deleteDoc(doc(db, COL, id));
};

// ─── Rest of functions ──────────────────────────────────────────────────────
export const getProduct = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

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