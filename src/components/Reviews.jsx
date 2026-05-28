import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase/config"; // تأكد إن المسار ده بيشاور على الـ config بتاعك

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    // بنجيب التقييمات للمنتج ده وبنرتبها من الأحدث للأقدم
    const q = query(
      collection(db, "reviews"), 
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  if (loading) return <p>جاري تحميل التقييمات...</p>;

  return (
    <div style={{ marginTop: "3rem", padding: "2rem", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
      <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>آراء العملاء ({reviews.length})</h3>
      
      {reviews.length === 0 ? (
        <p style={{ color: "#888" }}>لا توجد تقييمات لهذا المنتج بعد.</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} style={{ borderBottom: "1px solid #F0E8DF", padding: "1rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <strong style={{ color: "#3D2B1F" }}>{review.userName}</strong>
              <span style={{ color: "#C9A96E" }}>{"★".repeat(review.rating)}</span>
            </div>
            <p style={{ color: "#555", margin: 0 }}>{review.comment}</p>
            <small style={{ color: "#aaa" }}>
              {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : ""}
            </small>
          </div>
        ))
      )}
    </div>
  );
}