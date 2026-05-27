import { db } from "./config";
import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";

// 1. إضافة كوبون جديد (للأدمن)
export const addCoupon = async (code, discountPercent) => {
  await addDoc(collection(db, "coupons"), {
    code: code.toUpperCase(), // بنحفظه حروف كبيرة دايماً
    discount: discountPercent,
    createdAt: new Date(),
  });
};

// 2. جلب كل الكوبونات (للأدمن)
export const getCoupons = async () => {
  const snap = await getDocs(collection(db, "coupons"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 3. حذف كوبون (للأدمن)
export const deleteCoupon = async (id) => {
  await deleteDoc(doc(db, "coupons", id));
};

// 4. التحقق من الكوبون (للعميل في سلة المشتريات)
export const validateCoupon = async (code) => {
  const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null; // الكوبون غير صالح
  return snap.docs[0].data().discount; // بيرجع نسبة الخصم
};