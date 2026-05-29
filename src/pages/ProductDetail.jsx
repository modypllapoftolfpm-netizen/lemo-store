import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getProduct } from "../firebase/products";
import { addReview, subscribeToProductReviews, toggleReviewVisibility } from "../firebase/reviews";

export default function ProductDetail() {
  const { id } = useParams();
  const { field, lang } = useLang();
  const { addToCart } = useCart();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [file, setFile] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", customerName: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getProduct(id).then((p) => {
      if (!p) {
        navigate("/products");
      } else {
        setProduct(p);
        // تعيين أول صورة كصورة أساسية
        const initialImg = Array.isArray(p.imageUrl) ? p.imageUrl[0] : (p.imageUrl || p.image);
        setActiveImg(initialImg);
      }
    });
    const unsub = subscribeToProductReviews(id, setReviews);
    return unsub;
  }, [id, navigate]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lemo_reviews");
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dakjxjp0l/image/upload`, { method: "POST", body: formData });
      const data = await response.json();
      return data.secure_url || null;
    } catch (error) { return null; }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let imageUrl = "";
    if (file) { imageUrl = await uploadToCloudinary(file); }
    await addReview({ productId: id, userId: user?.uid || "guest", ...reviewForm, imageUrl, visible: false });
    setReviewForm({ rating: 5, comment: "", customerName: "", email: "" });
    setFile(null);
    setSubmitting(false);
    alert("تم إرسال التقييم للمراجعة بنجاح ✨");
  };

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "10rem", fontFamily: "Cairo" }}>جاري تحميل القطعة الفنية...</div>
    </div>
  );

  // حساب السعر والخصم
  const hasDiscount = product.discount > 0;
  const finalPrice = hasDiscount ? product.price - (product.price * (product.discount / 100)) : product.price;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {/* قسم تفاصيل المنتج - ديزاين فخم */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "3rem", background: "#fff", padding: "2.5rem", borderRadius: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #F0E8DF", marginBottom: "3rem" }}>
          
          {/* الجانب الأيمن: ألبوم الصور */}
          <div>
            <div style={{ width: "100%", height: "500px", borderRadius: "24px", overflow: "hidden", border: "1px solid #E8DDD0", marginBottom: "1rem" }}>
              <img src={activeImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={product.nameAr} />
            </div>
            
            {/* عرض صور الألبوم المصغرة لو موجودة */}
            {Array.isArray(product.imageUrl) && product.imageUrl.length > 1 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {product.imageUrl.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(img)} style={{ width: "75px", height: "90px", borderRadius: "12px", overflow: "hidden", border: activeImg === img ? "2.5px solid #C9A96E" : "1px solid #E8DDD0", padding: 0, cursor: "pointer", background: "transparent", transition: "0.2s" }}>
                    <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* الجانب الأيسر: الداتا والبيع */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
             <span style={{ color: "#C9A96E", fontWeight: "900", letterSpacing: "1.5px", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                {product.category === "scented" ? "Premium Collection" : "Handmade Art"}
             </span>
             <h1 style={{ fontSize: "2.5rem", color: "#3D2B1F", fontWeight: "900", margin: "0 0 1rem 0" }}>{field(product, "name")}</h1>
             
             {/* السعر والخصم */}
             <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.2rem", fontWeight: "900", color: "#111" }}>{finalPrice} ج.م</span>
                {hasDiscount && (
                  <>
                    <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: "1.3rem" }}>{product.price} ج.م</span>
                    <span style={{ background: "#FFF0F0", color: "#FF4D4D", padding: "4px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold" }}>خصم %{product.discount}</span>
                  </>
                )}
             </div>

             <p style={{ color: "#666", lineHeight: "1.8", fontSize: "1.05rem", marginBottom: "2rem" }}>{field(product, "desc")}</p>

             {/* 🛠️ حل مشكلة إظهار المخزون من الإعدادات */}
             {product.showStock && product.stock > 0 && (
                <div style={{ background: "#FFF9E6", color: "#3D2B1F", padding: "12px 20px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "bold", marginBottom: "1.5rem", border: "1px solid #FFE699", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🔥</span> متبقي {product.stock} قطعة فقط! أضف لمسة فخامة لمنزلك الآن.
                </div>
             )}

             <button onClick={() => addToCart(product)} style={{ width: "100%", background: "#111", color: "#fff", padding: "18px", borderRadius: "15px", border: "none", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", transition: "0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                إضافة إلى سلة المشتريات 🛍️
             </button>
          </div>
        </div>

        {/* قسم التقييمات - ديزاين احترافي */}
        <div style={{ background: "#fff", padding: "2.5rem", borderRadius: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #F0E8DF" }}>
          <h3 style={{ color: "#3D2B1F", fontSize: "1.6rem", fontWeight: "900", marginBottom: "2rem", borderBottom: "2px solid #FAF7F2", paddingBottom: "10px" }}>⭐ آراء مجتمع Lemo Luxe</h3>
          
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {reviews.filter(rev => rev.visible || isAdmin).length === 0 ? (
              <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>لا توجد تقييمات معتمدة بعد لهذه القطعة.</p>
            ) : (
              reviews.filter(rev => rev.visible || isAdmin).map((rev, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: rev.visible ? "#FAF8F5" : "#FFF0F0", borderRadius: "20px", border: "1px solid #F0E8DF", opacity: rev.visible ? 1 : 0.7 }}>
                  <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    {rev.imageUrl && <img src={rev.imageUrl} style={{ width: "75px", height: "90px", borderRadius: "12px", objectFit: "cover", border: "1px solid #E8DDD0" }} alt="" />}
                    <div>
                      <h4 style={{ margin: "0 0 5px", color: "#3D2B1F" }}>{rev.customerName} {!rev.visible && <span style={{ color: "#ff4d4d", fontSize: "0.7rem" }}>(مخفي)</span>}</h4>
                      <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>{rev.comment}</p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button onClick={() => toggleReviewVisibility(rev.id, rev.visible)} style={{ padding: "8px 15px", cursor: "pointer", background: rev.visible ? "#FF4D4D" : "#28A745", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "0.8rem" }}>
                      {rev.visible ? "إخفاء" : "إظهار"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* فورم إضافة التقييم */}
          <form onSubmit={handleReview} style={{ marginTop: "3rem", background: "#FAF8F5", padding: "2rem", borderRadius: "24px", border: "1px solid #F0E8DF" }}>
            <h4 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>✨ أضف تقييمك الخاص</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <input placeholder="اسمك الكريم" onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})} style={{ padding: "12px", borderRadius: "12px", border: "1px solid #E8DDD0", outline: "none" }} required />
              <label style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "0 15px", borderRadius: "12px", border: "1px solid #E8DDD0", cursor: "pointer", fontSize: "0.85rem", color: "#8B7355" }}>
                 📷 {file ? "تم اختيار صورة" : "أرفق صورة للمنتج"}
                 <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
              </label>
            </div>
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="شاركنا رأيك في العطر، التغليف، وتجربة الشراء..." style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "1px solid #E8DDD0", outline: "none", minHeight: "100px", resize: "none", boxSizing: "border-box" }} required />
            
            <button type="submit" disabled={submitting} style={{ marginTop: "1rem", width: "100%", padding: "15px", background: "#111", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>
              {submitting ? "جاري المعالجة..." : "إرسال التقييم للمراجعة ✨"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}