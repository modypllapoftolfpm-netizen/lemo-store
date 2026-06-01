import { 
  collection, addDoc, onSnapshot, query, where, 
  serverTimestamp, doc, updateDoc 
} from "firebase/firestore";
import { db } from "./config";

// دالة إضافة تقييم جديد
export const addReview = async (data) => {
  return await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: serverTimestamp(),
    // بناخد الحالة اللي مبعوتة من الصفحة (مخفي)، ولو مفيش بنخليها مخفية كأمان
    visible: data.visible !== undefined ? data.visible : false, 
  });
};

// الدالة الجديدة: تبديل حالة الظهور (الأدمن بيستخدمها)
export const toggleReviewVisibility = async (reviewId, targetVisibility) => {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    visible: targetVisibility // بنطبق الحالة اللي الأدمن اختارها مباشرة
  });
};

// دالة جلب التقييمات
export const subscribeToProductReviews = (productId, callback) => {
  // شيلنا الـ orderBy عشان نتفادى خطأ الـ Index بتاع الفايربيز
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId)
  );
  
  return onSnapshot(q, (snap) => {
    let reviewsList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // الترتيب من الأحدث للأقدم بيتم هنا بالكود عشان نريح الفايربيز
    reviewsList.sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });
    
    callback(reviewsList);
  }, (error) => {
    console.error("خطأ في جلب التقييمات:", error);
  });
};