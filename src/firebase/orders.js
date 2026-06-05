import { 
  collection, doc, addDoc, updateDoc, query, 
  serverTimestamp, getDoc, getDocs, orderBy 
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
  await updateDoc(doc(db, COL, id), {
    orderStatus, 
    status: orderStatus, 
    updatedAt: serverTimestamp(),
  });
};

export const getAllOrders = async () => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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