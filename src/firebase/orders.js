import { 
  collection, doc, addDoc, updateDoc,
  getDoc, getDocs, serverTimestamp
} from "firebase/firestore";
import { db } from "./config";

const COL = "orders";

// ─── Create order ────────────────────────────────────────────────────────────
export const createOrder = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COL), {
      ...data,
      orderStatus: "pending",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ تم الحفظ بنجاح! رقم الطلب هو:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("❌ فشل الحفظ:", error.message);
    throw error;
  }
};

// ─── Update order status ──────────────────────────────────────────────────────
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    await updateDoc(doc(db, COL, id), {
      orderStatus,
      status: orderStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// ─── Get All Orders ───────────────────────────────────────────────────────────
export const getAllOrders = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// ─── Update payment status ────────────────────────────────────────────────────
export const updatePaymentStatus = async (id, paymentStatus, extra = {}) => {
  return await updateDoc(doc(db, COL, id), {
    paymentStatus,
    ...extra,
    updatedAt: new Date().toISOString(),
  });
};

// ─── Get single order ─────────────────────────────────────────────────────────
export const getOrder = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};