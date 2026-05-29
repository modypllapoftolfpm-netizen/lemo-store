import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import Navbar from "../../components/layout/Navbar";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchReviews = async () => {
    try {
      const snap = await getDocs(collection(db, "reviews"));
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("خطأ في جلب التقييمات:", e);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleUpdateReview = async (id, currentFeatured, currentImg) => {
    setLoadingId(id);
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, {
        featured: currentFeatured || false,
        imageUrl: currentImg || ""
      });
      alert("✨ تم تحديث حالة التقييم بنجاح!");
    } catch (e) {
      alert("❌ حدث خطأ أثناء التحديث");
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذا التقييم نهائياً؟")) {
      try {
        await deleteDoc(doc(db, "reviews", id));
        setReviews(prev => prev.filter(r => r.id !== id));
      } catch (e) { alert("❌ فشل الحذف"); }
    }
  };

  const handleImageUpload = async (e, reviewId) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingId(reviewId + "_upload"); 
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "lemo_reviews"); 
      const res = await fetch("https://api.cloudinary.com/v1_1/dakjxjp0l/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, imageUrl: data.secure_url } : r));
      }
    } catch (error) { alert("حدث خطأ أثناء الرفع."); }
    setLoadingId(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ color: "#3D2B1F", margin: 0 }}>⭐ إدارة آراء العملاء</h2>
          <span style={{ background: "#E8DDD0", padding: "5px 15px", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "bold" }}>
            {reviews.length} تقييم
          </span>
        </div>

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #F0E8DF", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1.5rem" }}>
              
              <div style={{ flex: "1 1 300px", display: "flex", gap: "15px" }}>
                <div style={{ minWidth: "50px", height: "50px", background: "#3D2B1F", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {(r.customerName || "ع").charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#111" }}>{r.customerName || "عميل مجهول"}</h4>
                  <div style={{ color: "#C9A96E", fontSize: "0.8rem", marginBottom: "8px" }}>
                    {"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}
                  </div>
                  <p style={{ color: "#666", margin: 0, lineHeight: "1.6", fontStyle: "italic" }}>"{r.comment || r.review}"</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                {/* معاينة الصورة المرفوعة */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "12px", border: "2px dashed #E8DDD0", overflow: "hidden", position: "relative", background: "#FAF8F5" }}>
                    {r.imageUrl ? (
                      <img src={r.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    ) : (
                      <span style={{ fontSize: "0.7rem", color: "#888", display: "block", marginTop: "25px" }}>لا توجد صورة</span>
                    )}
                    <input type="file" onChange={(e) => handleImageUpload(e, r.id)} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#C9A96E" }}>{loadingId === r.id + "_upload" ? "جاري الرفع..." : "تغيير الصورة"}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" }}>
                    <input type="checkbox" checked={r.featured || false} onChange={(e) => setReviews(prev => prev.map(item => item.id === r.id ? {...item, featured: e.target.checked} : item))} style={{ width: "18px", height: "18px" }} />
                    تميز في الرئيسية
                  </label>
                  
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleUpdateReview(r.id, r.featured, r.imageUrl)} disabled={loadingId === r.id} style={{ background: "#3D2B1F", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", flex: 1 }}>
                      {loadingId === r.id ? "..." : "حفظ"}
                    </button>
                    <button onClick={() => handleDelete(r.id)} style={{ background: "#FFF0F0", color: "#FF4D4D", border: "1px solid #FFDada", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}