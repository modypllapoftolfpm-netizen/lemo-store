import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";

const COL = "products";

// ─── دالة رفع صورة واحدة (القديمة المضمونة) ──────────────────────────────────
export const uploadProductImage = async (file, productId) => {
  const path = `products/${productId}_${Date.now()}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

// ─── الدالة الذكية لرفع عدد لا نهائي من الصور وتحويلها لنص مفصول بـ , ───────
export const uploadMultipleImagesToText = async (files, productId) => {
  const urls = [];
  const paths = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `products/${productId}_${Date.now()}_${i}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
    paths.push(path);
  }
  
  // بنرجع الروابط والمسارات مدموجة بنص يفصل بينهم الفاصلة ,
  return {
    imageUrl: urls.join(","),
    imagePath: paths.join(",")
  };
};

// ─── Delete image from Storage ──────────────────────────────────────────────
export const deleteProductImage = async (imagePath) => {
  if (!imagePath) return;
  // لو فيه كذا مسار ممسوحين بالفاصلة بنلف عليهم ونحذفهم
  const paths = imagePath.split(",");
  for (const path of paths) {
    const storageRef = ref(storage, path.trim());
    await deleteObject(storageRef).catch(() => {});
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
export const deleteProduct = async (id, imagePath) => {
  await deleteProductImage(imagePath);
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

// ─── Real-time listeners ────────────────────────────────────────────────────
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