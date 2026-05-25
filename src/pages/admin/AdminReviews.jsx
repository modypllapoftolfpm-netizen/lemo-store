import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const snap = await getDocs(collection(db, "reviews"));
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
    }
    fetchReviews();
  }, []);

  const handleUpdateReview = async (id, currentFeatured, currentImg) => {
    setLoadingId(id);
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, {
        featured: currentFeatured || false,
        imageUrl: currentImg || ""
      });
      alert("تم تحديث التقييم بنجاح! ✨");
    } catch (e) {
      alert("حدث خطأ أثناء التحديث");
    }
    setLoadingId(null);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }} dir="rtl">
      <h2 style={{ color: "#3D2B1F", paddingBottom: "1rem", marginBottom: "2rem" }}>🕯️ إدارة آراء وتقييمات العملاء</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: "15px", padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ flex: "1 1 400px" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>{r.customerName || "عميل حقيقي"}</h4>
              <p style={{ color: "#666", margin: 0 }}>"{r.comment || r.review}"</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
              <input 
                type="text"
                placeholder="رابط صورة Cloudinary" 
                defaultValue={r.imageUrl || ""}
                onChange={(e) => { r.imageUrl = e.target.value; }}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", width: "250px" }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input 
                  type="checkbox" 
                  defaultChecked={r.featured || false}
                  onChange={(e) => { r.featured = e.target.checked; }}
                />
                عرض في الرئيسية
              </label>
              <button 
                onClick={() => handleUpdateReview(r.id, r.featured, r.imageUrl)}
                disabled={loadingId === r.id}
                style={{ background: "#111", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
              >
                {loadingId === r.id ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}