import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, serverTimestamp, getDoc,
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
    // ده اللي هيقولنا إيه اللي بيحصل
    alert("فشل الحفظ: " + error.message);
    throw error;
  }
};
// ─── Update order status ────────────────────────────────────────────────────
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    // بنحدث حقل orderStatus اللي بيقرأ منه كود الأدمن الجديد
    await updateDoc(doc(db, COL, id), {
      orderStatus, 
      status: orderStatus, // بنحدث الحقلين عشان نضمن التوافق
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
    alert("حدث خطأ أثناء تعديل الحالة");
  }
};

// ─── Real-time — all orders (admin) ─────────────────────────────────────────
export const subscribeToAllOrders = (callback) => {
  const q = query(collection(db, COL));
  return onSnapshot(q, (snap) => {
    let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // ترتيب الطلبات برمجياً من الأحدث للأقدم
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });
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