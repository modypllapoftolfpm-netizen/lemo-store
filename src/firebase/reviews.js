import { 
  collection, addDoc, onSnapshot, query, where, 
  orderBy, serverTimestamp, doc, updateDoc 
} from "firebase/firestore";
import { db } from "./config";

// دالة إضافة تقييم جديد
export const addReview = async (data) => {
  return await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: serverTimestamp(),
    visible: true, // أي تقييم جديد يظهر للعامة أوتوماتيك
  });
};

// الدالة الجديدة: تبديل حالة الظهور (الأدمن بيستخدمها)
export const toggleReviewVisibility = async (reviewId, currentVisibility) => {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    visible: !currentVisibility // بيعكس القيمة (لو true يخليها false والعكس)
  });
};

// دالة جلب التقييمات
export const subscribeToProductReviews = (productId, callback) => {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};