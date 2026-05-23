import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db } from "./config";

const COL = "orders";

export const createOrder = async (data) => {
  return await addDoc(collection(db, COL), {
    ...data,
    orderStatus: "pending",
    paymentStatus: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateOrderStatus = async (id, orderStatus) => {
  return await updateDoc(doc(db, COL, id), {
    orderStatus,
    updatedAt: serverTimestamp(),
  });
};

export const updatePaymentStatus = async (id, paymentStatus, extra = {}) => {
  return await updateDoc(doc(db, COL, id), {
    paymentStatus,
    ...extra,
    updatedAt: serverTimestamp(),
  });
};

export const getOrder = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const subscribeToAllOrders = (callback) => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const subscribeToUserOrders = (userId, callback) => {
  const q = query(
    collection(db, COL),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};