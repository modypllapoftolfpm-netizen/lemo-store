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
      // التعديل هنا: الرسالة اللي طلبتها
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
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        <div style={{ background: "#fff", padding: "2.5rem", borderRadius: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem", border: "1px solid #E8DDD0", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
           {/* صور المنتج */}
           <div>
              <img src={activeImg} style={{ width: "100%", borderRadius: "15px", marginBottom: "15px", objectFit: "cover", aspectRatio: "1/1", border: "1px solid #F0E8DF" }} alt={field(product, "name")} />
              <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                {Array.isArray(product.imageUrl) && product.imageUrl.map((img, i) => (
                  <img key={i} src={img} onClick={() => setActiveImg(img)} style={{ width: "70px", height: "70px", objectFit: "cover", cursor: "pointer", borderRadius: "10px", border: activeImg === img ? "3px solid #C9A96E" : "1px solid #E8DDD0", transition: "0.3s" }} />
                ))}
              </div>
           </div>

           {/* تفاصيل المنتج */}
           <div>
             <h1 style={{ color: "#3D2B1F", margin: "0 0 15px 0", fontWeight: "900", fontSize: "2rem" }}>{field(product, "name")}</h1>
             
             <div style={{ marginBottom: "20px", display: "flex", alignItems: "baseline", gap: "15px", background: "#FAF8F5", padding: "15px", borderRadius: "12px", border: "1px solid #F0E8DF" }}>
               <span style={{ fontSize: "2rem", color: "#C9A96E", fontWeight: "900" }}>{product.price} ج.م</span>
               {product.oldPrice > 0 && (
                 <span style={{ textDecoration: "line-through", color: "#A89A8E", fontSize: "1.2rem", fontWeight: "bold" }}>{product.oldPrice} ج.م</span>
               )}
             </div>

             <p style={{ color: "#666", lineHeight: "1.8", marginBottom: "25px", fontSize: "1.05rem" }}>{field(product, "desc")}</p>

             {product.showStock && product.stock > 0 && (
               <div style={{ background: "#FFF9E6", color: "#B8860B", padding: "12px 20px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "bold", marginBottom: "1.5rem", border: "1px solid #FFE699", display: "flex", alignItems: "center", gap: "8px" }}>
                 🔥 متبقي {product.stock} قطعة فقط في المخزن!
               </div>
             )}

             <button onClick={() => addToCart(product)} style={{ background: "linear-gradient(135deg, #3D2B1F, #2A1D15)", color: "#fff", padding: "16px 30px", border: "none", borderRadius: "12px", cursor: "pointer", width: "100%", fontWeight: "bold", fontSize: "1.1rem", transition: "0.3s", boxShadow: "0 5px 15px rgba(61,43,31,0.2)" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
               إضافة للسلة 🛍️
             </button>
           </div>
        </div>

        {/* نظام التقييمات */}
        <div style={{ background: "#fff", padding: "2.5rem", borderRadius: "24px", marginTop: "2rem", border: "1px solid #E8DDD0", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
          <h2 style={{ color: "#3D2B1F", fontWeight: "900", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
            ⭐ آراء عملائنا المميزين
          </h2>

          {visibleReviews.length === 0 ? (
            <p style={{ color: "#8B7355", textAlign: "center", padding: "2rem", background: "#FAF8F5", borderRadius: "12px", fontWeight: "bold" }}>لا توجد تقييمات حتى الآن. كن أول من يشاركنا رأيه!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "3rem" }}>
              {visibleReviews.map(rev => (
                <div key={rev.id} style={{ padding: "1.5rem", background: "#FAF8F5", borderRadius: "16px", border: "1px solid #F0E8DF", opacity: rev.visible ? 1 : 0.6, transition: "0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                    <span style={{ fontWeight: "900", color: "#3D2B1F", fontSize: "1.1rem" }}>👤 {rev.customerName || "عميل مميز"}</span>
                    <span style={{ color: "#C9A96E", fontSize: "1.2rem", letterSpacing: "2px" }}>{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</span>
                  </div>
                  <p style={{ color: "#555", margin: "0 0 15px 0", lineHeight: "1.7" }}>{rev.comment}</p>
                  
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

          <form onSubmit={handleReview} style={{ borderTop: "2px solid #F0E8DF", paddingTop: "2rem" }}>
            <h3 style={{ color: "#8B7355", marginBottom: "1.5rem", fontWeight: "800" }}>أضف تقييمك لقطعتك الخاصة</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
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
            <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "14px 30px", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", width: "fit-content" }}>
              {submitting ? "جاري الإرسال..." : "إرسال التقييم ✉️"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}