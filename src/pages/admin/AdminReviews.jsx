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

  // دالة ذكية لرفع الصورة مباشرة إلى Cloudinary
  const handleImageUpload = async (e, reviewId) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingId(reviewId + "_upload"); 
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // ⚠️ تنبيه هام: استبدل YOUR_UPLOAD_PRESET و YOUR_CLOUD_NAME ببيانات حسابك الحقيقية
      formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); 
      
      const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.secure_url) {
        // تحديث رابط الصورة في الـ state عشان تظهر كمعاينة فوراً
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, imageUrl: data.secure_url } : r));
        alert("✅ تم رفع الصورة بنجاح! اضغط 'حفظ' لتأكيد التعديل.");
      } else {
        alert("❌ تأكد من بيانات Cloudinary (Preset و Cloud Name)");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء رفع الصورة.");
    }
    setLoadingId(null);
  };

  // دالة لتحديث حالة "عرض في الرئيسية" في الـ State
  const handleFeaturedChange = (reviewId, isChecked) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, featured: isChecked } : r));
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
            
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.2rem" }}>
              
              {/* زرار رفع الصورة الجديد بتصميم فخم ومدمج */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, r.id)}
                  style={{ padding: "8px", borderRadius: "8px", border: "2px dashed #C9A96E", width: "180px", cursor: "pointer", background: "#FAF8F5" }}
                />
                {loadingId === r.id + "_upload" && <span style={{ fontSize: "12px", color: "#C9A96E", fontWeight: "bold" }}>جاري الرفع...</span>}
                {r.imageUrl && (
                  <img src={r.imageUrl} alt="preview" style={{ width: "45px", height: "45px", borderRadius: "8px", objectFit: "cover", border: "1px solid #E8DDD0" }} />
                )}
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "bold", color: "#3D2B1F" }}>
                <input 
                  type="checkbox" 
                  checked={r.featured || false}
                  onChange={(e) => handleFeaturedChange(r.id, e.target.checked)}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                عرض في الرئيسية
              </label>
              
              <button 
                onClick={() => handleUpdateReview(r.id, r.featured, r.imageUrl)}
                disabled={loadingId === r.id}
                style={{ background: "#111", color: "#fff", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", minWidth: "90px", transition: "0.2s" }}
              >
                {loadingId === r.id ? "⏳..." : "حفظ"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}