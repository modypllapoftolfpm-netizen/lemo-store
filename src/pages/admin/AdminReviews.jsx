import { useState, useEffect } from "react";
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
        console.error("Error fetching reviews:", e);
      }
    }
    fetchReviews();
  }, []);

  const handleUpdateReview = async (id, currentFeatured, currentImg) => {
    setLoadingId(id);
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, {
        featured: currentFeatured,
        imageUrl: currentImg || ""
      });
      alert("تم تحديث التقييم بنجاح! ✨");
    } catch (e) {
      alert("حدث خطأ أثناء التحديث");
    }
    setLoadingId(null);
  };

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Alexandria', sans-serif" }} dir="rtl">
      <h2 style={{ color: "#3D2B1F", borderBottom: "2px solid #E8DDD0", paddingBottom: "1rem", marginBottom: "2rem" }}>🕯️ إدارة آراء وتقييمات العملاء</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: "15px", padding: "1.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
            
            <div style={{ flex: "1 1 400px" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#111" }}>{r.customerName || "عميل حقيقي"} <span style={{ color: "#C9A96E" }}>{"★".repeat(r.rating || 5)}</span></h4>
              <p style={{ color: "#666", margin: 0, fontStyle: "italic" }}>"{r.comment || r.review}"</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
              {/* خانة رابط صورة Cloudinary */}
              <input 
                type="text"
                placeholder="ضع رابط صورة Cloudinary هنا" 
                defaultValue={r.imageUrl || ""}
                onChange={(e) => { r.imageUrl = e.target.value; }}
                style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #E8DDD0", width: "280px", outline: "none" }}
              />

              {/* اختيار إذا كان يظهر في الصفحة الرئيسية أم لا */}
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "600", color: "#3D2B1F" }}>
                <input 
                  type="checkbox" 
                  defaultChecked={r.featured || false}
                  onChange={(e) => { r.featured = e.target.checked; }}
                  style={{ width: "18px", height: "18px" }}
                />
                عرض في الرئيسية
              </label>

              {/* زر الحفظ */}
              <button 
                onClick={() => handleUpdateReview(r.id, r.featured, r.imageUrl)}
                disabled={loadingId === r.id}
                style={{ background: "#111", color: "#fff", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "0.2s", opacity: loadingId === r.id ? 0.5 : 1 }}
              >
                {loadingId === r.id ? "جاري الحفظ..." : "حفظ التعديل"}
              </button>
            </div>

          </div>
        ))}

        {reviews.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>لا توجد تقييمات مضافة في قاعدة البيانات حتى الآن.</p>}
      </div>
    </div>
  );
}