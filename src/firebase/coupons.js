import { db } from "./config";
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, updateDoc } from "firebase/firestore";

// 1. إضافة كوبون جديد متطور (للأدمن)
export const addCoupon = async (couponData) => {
  await addDoc(collection(db, "coupons"), {
    code: couponData.code.toUpperCase().trim(),
    discount: parseFloat(couponData.discount || 0),
    type: couponData.type || "percentage", // percentage أو fixed
    minSubtotal: parseFloat(couponData.minSubtotal || 0),
    expiryDate: couponData.expiryDate || null, // صيغة YYYY-MM-DD
    scope: couponData.scope || "all",          // 🔴 النطاق (الكل - قسم - منتج)
    targetIds: couponData.targetIds || [],     // 🔴 مصفوفة المنتجات/الأقسام المحددة
    active: true,
    createdAt: new Date(),
  });
};

// 2. تحديث حالة الكوبون (تشغيل/توقيف يدوياً من الأدمن)
export const toggleCouponActive = async (id, currentStatus) => {
  await updateDoc(doc(db, "coupons", id), { active: !currentStatus });
};

// 3. جلب كل الكوبونات (للأدمن)
export const getCoupons = async () => {
  const snap = await getDocs(collection(db, "coupons"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 4. حذف كوبون (للأدمن)
export const deleteCoupon = async (id) => {
  await deleteDoc(doc(db, "coupons", id));
};

// 5. التحقق الذكي من الكوبون (للعميل في السلة)
export const validateCoupon = async (code, currentSubtotal) => {
  if (!code) return { valid: false, msg: "الرجاء إدخال كود الكوبون" };
  
  const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase().trim()));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return { valid: false, msg: "❌ هذا الكوبون غير موجود" };
  }
  
  const coupon = snap.docs[0].data();
  const couponId = snap.docs[0].id;

  // فحص 1: هل الكوبون نشط؟
  if (coupon.active === false) {
    return { valid: false, msg: "❌ هذا الكوبون تم إيقافه" };
  }

  // فحص 2: هل انتهت صلاحيته؟
  if (coupon.expiryDate) {
    const today = new Date().toISOString().split('T')[0];
    if (today > coupon.expiryDate) {
      return { valid: false, msg: "❌ هذا الكوبون منتهي الصلاحية" };
    }
  }

  // فحص 3: هل المجموع يغطي الحد الأدنى؟
  if (currentSubtotal < (coupon.minSubtotal || 0)) {
    return { 
      valid: false, 
      msg: `❌ الحد الأدنى لتفعيل هذا الكوبون هو ${coupon.minSubtotal} ج.م (مجموعك الحالي: ${currentSubtotal} ج.م)` 
    };
  }

  // إذا نجحت كل الفحوصات، بنرجع الكوبون ناجح وبياناته
  return {
    valid: true,
    msg: "✅ تم تطبيق الكوبون بنجاح!",
    data: { id: couponId, ...coupon }
  };
};