import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getProduct } from "../firebase/products";
import { addReview, subscribeToProductReviews } from "../firebase/reviews";

export default function ProductDetail() {
  const { id } = useParams();
  const { t, field } = useLang();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const settings = product?.settings || {}; 

  const [reviewForm, setReviewForm] = useState({ 
    rating: 5, comment: "", customerName: "", email: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => { if (!p) navigate("/products"); else setProduct(p); });
    const unsub = subscribeToProductReviews(id, setReviews);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (user && profile) {
      setReviewForm(prev => ({
        ...prev,
        customerName: profile.name || "",
        email: user.email || ""
      }));
    }
  }, [user, profile]);

  if (!product) return <div style={{ minHeight: "100vh", background: "#FAF7F2" }}><Navbar /><div style={{ textAlign: "center", padding: "5rem" }}>جاري التحميل...</div></div>;

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await addReview({ productId: id, userId: user?.uid || "guest", ...reviewForm, featured: false, imageUrl: "" });
    setReviewForm({ rating: 5, comment: "", customerName: "", email: "" });
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#C9A96E", cursor: "pointer", marginBottom: "1rem", fontWeight: "bold" }}>← رجوع</button>
        
        <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          {/* صورة المنتج */}
          <div style={{ flex: 1, minWidth: "300px", height: "450px", background: "#fff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px" }} />
          </div>

          {/* تفاصيل المنتج */}
          <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 style={{ color: "#3D2B1F", margin: "0 0 10px 0", fontSize: "2.2rem" }}>{field(product, "name")}</h1>
            <p style={{ color: "#C9A96E", fontSize: "2rem", fontWeight: "900", margin: "0 0 15px 0" }}>{product.price} {t.currency}</p>
            <p style={{ color: "#666", lineHeight: "1.8", fontSize: "1.05rem", marginBottom: "1.5rem" }}>{field(product, "desc")}</p>
            
            <p style={{ color: product.stock > 0 ? "#4CAF50" : "#cc0000", fontWeight: "700", marginBottom: "1.5rem" }}>
              {product.stock > 0 ? (
                product.showStockCount ? `✅ متوفر (${product.stock} قطعة)` : "✅ متوفر في المخزن"
              ) : "❌ نفذت الكمية"}
            </p>

            <div style={{ display: "flex", gap: "15px", marginBottom: "2rem" }}>
              <button onClick={handleAdd} disabled={product.stock === 0} style={{ flex: 1, padding: "16px", borderRadius: "12px", background: added ? "#4CAF50" : "linear-gradient(135deg, #111, #3D2B1F)", color: "#fff", border: "none", cursor: product.stock === 0 ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1.1rem", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", transition: "0.3s" }}>
                {added ? "✓ تمت الإضافة بنجاح" : t.products.addToCart}
              </button>
              <button onClick={() => toggleWishlist(product)} style={{ padding: "0 20px", background: "#fff", border: "2px solid #E8DDD0", borderRadius: "12px", fontSize: "1.5rem", cursor: "pointer", transition: "0.3s" }}>
                {isInWishlist(product.id) ? "❤️" : "🤍"}
              </button>
            </div>

            {/* دليل العناية بمنتجات Lemo */}
            <div style={{ padding: "1.5rem", background: "#fff", borderRadius: "12px", border: "1px solid #E8DDD0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <h3 style={{ color: "#3D2B1F", margin: "0 0 1rem 0", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✨</span> دليل العناية بمنتجات Lemo
              </h3>
              <ul style={{ margin: 0, paddingRight: "1.2rem", color: "#666", lineHeight: "1.8", fontSize: "0.95rem" }}>
                <li style={{ marginBottom: "8px" }}><strong>تنبيه الديكور:</strong> العديد من شموعنا الفنية مصممة كقطع ديكور عطرية لإضافة لمسة جمالية للمكان وليست مخصصة للإشعال المباشر.</li>
                <li style={{ marginBottom: "8px" }}><strong>الحفظ:</strong> يرجى إبعاد الشموع عن أشعة الشمس المباشرة والحرارة للحفاظ على ألوانها وتفاصيلها.</li>
                <li><strong>في حال الإشعال:</strong> إذا كانت الشمعة قابلة للإشعال، استخدم دائماً طبقاً مقاوماً للحرارة أسفلها لحماية الأسطح.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}