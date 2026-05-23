import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COL = "products";

const CLOUDINARY_CLOUD = "dakjxjp0l";
const CLOUDINARY_PRESET = "yhabgqv3";

export const uploadProductImage = async (file) => {
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

export const deleteProductImage = async () => {};

export const addProduct = async (data) => {
  return await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id, data) => {
  const r = doc(db, COL, id);
  return await updateDoc(r, { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  return await deleteDoc(doc(db, COL, id));
};

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