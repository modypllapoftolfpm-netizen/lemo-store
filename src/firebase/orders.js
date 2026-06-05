import { 
  collection, doc, addDoc, updateDoc, onSnapshot, 
  query, serverTimestamp, getDoc, orderBy 
} from "firebase/firestore";
import { db } from "./config";

const COL = "orders";

// ─── Create order ───────────────────────────────────────────────────────────
export const createOrder = async (data) => {
  try {
    console.log("⏳ بحاول أحفظ الطلب في فايربيز...");
    const docRef = await addDoc(collection(db, COL), {
      ...data,
      orderStatus: "pending",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ تم الحفظ بنجاح! رقم الطلب في القاعدة هو:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("❌ فايربيز رفض الحفظ! السبب:", error.message);
    alert("فشل الحفظ: " + error.message);
    throw error;
  }
};

// ─── Update order status ────────────────────────────────────────────────────
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    await updateDoc(doc(db, COL, id), {
      orderStatus, 
      status: orderStatus, 
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
    alert("حدث خطأ أثناء تعديل الحالة");
  }
};

// ─── Real-time — all orders (admin) - الدالة اللي Vercel كان بيدور عليها ───
export const subscribeToAllOrders = (callback) => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
};

// ─── Update payment status ──────────────────────────────────────────────────
export const updatePaymentStatus = async (id, paymentStatus, extra = {}) => {
  return await updateDoc(doc(db, COL, id), {
    paymentStatus,
    ...extra,
    updatedAt: serverTimestamp(),
  });
};

// ─── Get single order ───────────────────────────────────────────────────────
export const getOrder = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};