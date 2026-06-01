import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getProduct } from "../firebase/products";
import { subscribeToProductReviews, addReview, toggleReviewVisibility } from "../firebase/reviews";

export default function ProductDetail() {
  const { id } = useParams();
  const { field, lang } = useLang();
  const { addToCart } = useCart();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", customerName: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => {
      if (!p) navigate("/products");
      else {
        setProduct(p);
        const initialImg = Array.isArray(p.imageUrl) ? p.imageUrl[0] : (p.imageUrl || "");
        setActiveImg(initialImg);
      }
    });
    const unsub = subscribeToProductReviews(id, setReviews);
    return unsub;
  }, [id, navigate]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName || !reviewForm.comment) {
      alert("برجاء إدخال الاسم والتقييم");
      return;
    }
    setSubmitting(true);
    try {
      await addReview({ productId: id, userId: user?.uid || "guest", ...reviewForm, visible: false });
      setReviewForm({ rating: 5, comment: "", customerName: "" });
      alert("تم إرسال تقييمك بنجاح! شكراً لمشاركتنا رأيك ✨");
    } catch (err) {
      alert("حدث خطأ أثناء إرسال التقييم");
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: "100%", padding: "12px 15px", borderRadius: "10px",
    border: "2px solid #F0E8DF", background: "#FCFAFC", color: "#3D2B1F",
    fontFamily: "Cairo", outline: "none", boxSizing: "border-box", transition: "0.3s"
  };

  const visibleReviews = isAdmin ? reviews : reviews.filter(r => r.visible);

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "5rem", fontFamily: "Cairo", color: "#C9A96E", fontWeight: "bold" }}>جاري تحميل القطعة الفنية...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      {/* 📱 أكواد التجاوب مع الموبايل */}
      <style>{`
        .pd-container { max-width: 1000px; margin: 2rem auto; padding: 0 1.5rem; }
        .pd-card { background: #fff; padding: 2.5rem; border-radius: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; border: 1px solid #E8DDD0; box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
        .pd-title { color: #3D2B1F; margin: 0 0 15px 0; font-weight: 900; font-size: 2.2rem; line-height: 1.3; }
        .pd-price-box { margin-bottom: 20px; display: flex; align-items: baseline; gap: 15px; background: #FAF8F5; padding: 15px; border-radius: 12px; border: 1px solid #F0E8DF; }
        .pd-price { font-size: 2.2rem; color: #C9A96E; font-weight: 900; }
        .pd-old-price { text-decoration: line-through; color: #A89A8E; font-size: 1.2rem; font-weight: bold; }
        .pd-desc { color: #666; line-height: 1.8; margin-bottom: 25px; font-size: 1.05rem; }
        .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .stock-badge { background: #FFF9E6; color: #B8860B; padding: 12px 20px; border-radius: 12px; font-size: 0.95rem; font-weight: bold; margin-bottom: 1.5rem; border: 1px solid #FFE699; display: flex; align-items: center; gap: 8px; }

        /* 📱 إعدادات الموبايل (شاشات أصغر من 768px) */
        @media (max-width: 768px) {
          .pd-container { padding: 0 1rem; margin: 1rem auto; }
          .pd-card { padding: 1.2rem; gap: 1.5rem; border-radius: 16px; grid-template-columns: 1fr; }
          .pd-title { font-size: 1.6rem; margin-bottom: 10px; }
          .pd-price-box { flex-direction: column; gap: 5px; padding: 12px; }
          .pd-price { font-size: 1.8rem; }
          .pd-desc { font-size: 0.95rem; margin-bottom: 20px; }
          .review-grid { grid-template-columns: 1fr; }
          .stock-badge { font-size: 0.85rem; padding: 10px; flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="pd-container">
        
        <div className="pd-card">
           {/* صور المنتج */}
           <div>
              <img src={activeImg} style={{ width: "100%", borderRadius: "15px", marginBottom: "15px", objectFit: "cover", aspectRatio: "1/1", border: "1px solid #F0E8DF" }} alt={field(product, "name")} />
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "5px" }}>
                {Array.isArray(product.imageUrl) && product.imageUrl.map((img, i) => (
                  <img key={i} src={img} onClick={() => setActiveImg(img)} style={{ width: "70px", height: "70px", minWidth: "70px", objectFit: "cover", cursor: "pointer", borderRadius: "10px", border: activeImg === img ? "3px solid #C9A96E" : "1px solid #E8DDD0", transition: "0.3s" }} alt="thumbnail" />
                ))}
              </div>
           </div>

           {/* تفاصيل المنتج */}
           <div>
             <h1 className="pd-title">{field(product, "name")}</h1>
             
             <div className="pd-price-box">
               <span className="pd-price">{product.price} ج.م</span>
               {product.oldPrice > 0 && (
                 <span className="pd-old-price">{product.oldPrice} ج.م</span>
               )}
             </div>

             <p className="pd-desc">{field(product, "desc")}</p>

             {product.showStock && product.stock > 0 && (
               <div className="stock-badge">
                 🔥 متبقي {product.stock} قطعة فقط في المخزن!
               </div>
             )}

             <button onClick={() => addToCart(product)} style={{ background: "linear-gradient(135deg, #3D2B1F, #2A1D15)", color: "#fff", padding: "16px 30px", border: "none", borderRadius: "12px", cursor: "pointer", width: "100%", fontWeight: "bold", fontSize: "1.1rem", transition: "0.3s", boxShadow: "0 5px 15px rgba(61,43,31,0.2)" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
               إضافة للسلة 🛍️
             </button>
           </div>
        </div>

        {/* نظام التقييمات */}
        <div className="pd-card" style={{ marginTop: "2rem" }}>
          <h2 style={{ color: "#3D2B1F", fontWeight: "900", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.5rem" }}>
            ⭐ آراء عملائنا المميزين
          </h2>

          {visibleReviews.length === 0 ? (
            <p style={{ color: "#8B7355", textAlign: "center", padding: "2rem", background: "#FAF8F5", borderRadius: "12px", fontWeight: "bold" }}>لا توجد تقييمات حتى الآن. كن أول من يشاركنا رأيه!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {visibleReviews.map(rev => (
                <div key={rev.id} style={{ padding: "1.2rem", background: "#FAF8F5", borderRadius: "16px", border: "1px solid #F0E8DF", opacity: rev.visible ? 1 : 0.6, transition: "0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <span style={{ fontWeight: "900", color: "#3D2B1F", fontSize: "1.05rem" }}>👤 {rev.customerName || "عميل مميز"}</span>
                    <span style={{ color: "#C9A96E", fontSize: "1.1rem", letterSpacing: "2px" }}>{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</span>
                  </div>
                  <p style={{ color: "#555", margin: "0 0 15px 0", lineHeight: "1.7", fontSize: "0.95rem" }}>{rev.comment}</p>
                  
                  {isAdmin && (
                    <div style={{ borderTop: "1px dashed #E8DDD0", paddingTop: "10px", textAlign: "left" }}>
                      <button 
                        onClick={() => toggleReviewVisibility(rev.id, !rev.visible)}
                        style={{ background: rev.visible ? "#FAF8F5" : "#3D2B1F", color: rev.visible ? "#E74C3C" : "#fff", border: rev.visible ? "1px solid #E74C3C" : "none", padding: "6px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}
                      >
                        {rev.visible ? "إخفاء التقييم 👁️‍🗨️" : "قبول وإظهار التقييم ✅"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleReview} style={{ borderTop: "2px solid #F0E8DF", paddingTop: "1.5rem" }}>
            <h3 style={{ color: "#8B7355", marginBottom: "1rem", fontWeight: "800", fontSize: "1.2rem" }}>أضف تقييمك لقطعتك الخاصة</h3>
            <div className="review-grid">
              <input name="customerName" value={reviewForm.customerName} onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})} placeholder="الاسم" style={inputStyle} required />
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})} style={inputStyle}>
                <option value={5}>⭐⭐⭐⭐⭐ ممتاز جداً</option>
                <option value={4}>⭐⭐⭐⭐ أعجبني</option>
                <option value={3}>⭐⭐⭐ جيد</option>
                <option value={2}>⭐⭐ مقبول</option>
                <option value={1}>⭐ سيء</option>
              </select>
            </div>
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="شاركنا رأيك في جودة وتفاصيل المنتج..." style={{ ...inputStyle, minHeight: "100px", resize: "none", marginBottom: "1rem" }} required />
            <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "14px 30px", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", width: "100%", maxWidth: "300px" }}>
              {submitting ? "جاري الإرسال..." : "إرسال التقييم ✉️"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}