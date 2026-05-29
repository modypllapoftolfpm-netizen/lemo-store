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
  const [file, setFile] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", customerName: "", email: "" });
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
    setSubmitting(true);
    // رفع الصورة لو موجودة (ممكن نضيف اللوجيك هنا لو حابب)
    await addReview({ productId: id, userId: user?.uid || "guest", ...reviewForm, visible: false });
    setReviewForm({ rating: 5, comment: "", customerName: "", email: "" });
    setSubmitting(false);
    alert("تم إرسال التقييم للمراجعة بنجاح ✨");
  };

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "5rem", fontFamily: "Cairo" }}>جاري تحميل القطعة الفنية...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "2rem" }}>
        
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
           {/* صور المنتج */}
           <div>
              <img src={activeImg} style={{ width: "100%", borderRadius: "10px", marginBottom: "10px" }} alt={field(product, "name")} />
              <div style={{ display: "flex", gap: "10px" }}>
                {Array.isArray(product.imageUrl) && product.imageUrl.map((img, i) => (
                  <img key={i} src={img} onClick={() => setActiveImg(img)} style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer", borderRadius: "5px", border: activeImg === img ? "2px solid #C9A96E" : "none" }} />
                ))}
              </div>
           </div>

           {/* تفاصيل المنتج */}
           <div>
             <h1 style={{ color: "#3D2B1F", margin: "0 0 10px 0" }}>{field(product, "name")}</h1>
             
             {/* 🛠️ قسم السعر المطور */}
             <div style={{ marginBottom: "15px", display: "flex", alignItems: "baseline", gap: "15px" }}>
               <span style={{ fontSize: "1.8rem", color: "#C9A96E", fontWeight: "900" }}>{product.price} ج.م</span>
               {product.oldPrice > 0 && (
                 <span style={{ textDecoration: "line-through", color: "#888", fontSize: "1.2rem" }}>{product.oldPrice} ج.م</span>
               )}
             </div>

             {/* 🛠️ الوصف */}
             <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>{field(product, "desc")}</p>

             {/* 🛠️ المخزون الذكي */}
             {product.showStock && product.stock > 0 && (
               <div style={{ background: "#FFF9E6", color: "#8B7355", padding: "10px 15px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "bold", marginBottom: "1rem", border: "1px solid #FFE699" }}>
                 🔥 متبقي {product.stock} قطعة فقط في المخزن!
               </div>
             )}

             <button onClick={() => addToCart(product)} style={{ background: "#3D2B1F", color: "#fff", padding: "15px 30px", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>إضافة للسلة 🛍️</button>
           </div>
        </div>
      </div>
    </div>
  );
}