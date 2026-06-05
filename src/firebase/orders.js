import { 
  collection, doc, addDoc, updateDoc, query, 
  getDoc, getDocs, orderBy 
} from "firebase/firestore/lite"; // 1. استيراد من lite فقط
import { dbLite } from "./config"; // 2. استخدام dbLite المباشر

const COL = "orders";

// ─── Create order ───────────────────────────────────────────────────────────
export const createOrder = async (data) => {
  try {
    // 🚀 استخدام dbLite للإرسال المباشر بدون انتظار قناة اتصال
    const docRef = await addDoc(collection(dbLite, COL), {
      ...data,
      orderStatus: "pending",
      paymentStatus: "pending",
      // الـ Lite لا يدعم serverTimestamp، لذا نستخدم التاريخ المحلي
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ تم الحفظ بنجاح! رقم الطلب هو:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("❌ فشل الحفظ:", error.message);
    throw error;
  }
};

// ─── Update order status ────────────────────────────────────────────────────
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    await updateDoc(doc(dbLite, COL, id), {
      orderStatus, 
      status: orderStatus, 
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// ─── Get All Orders ───────────────────────────────────────────────────────
export const getAllOrders = async () => {
  try {
    // الـ Lite لا يدعم orderBy بالطريقة المعقدة، فنجلب البيانات ونرتبها في الكود
    const snap = await getDocs(collection(dbLite, COL));
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // الترتيب من الأحدث للأقدم
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

// ─── Update payment status ──────────────────────────────────────────────────
export const updatePaymentStatus = async (id, paymentStatus, extra = {}) => {
  return await updateDoc(doc(dbLite, COL, id), {
    paymentStatus,
    ...extra,
    updatedAt: new Date().toISOString(),
  });
};

// ─── Get single order ───────────────────────────────────────────────────────
export const getOrder = async (id) => {
  const snap = await getDoc(doc(dbLite, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};