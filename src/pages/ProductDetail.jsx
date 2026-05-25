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
  
  // تحديث الـ state ليشمل خانات بوهاوس بالكامل
  const [reviewForm, setReviewForm] = useState({ 
    rating: 5, 
    comment: "", 
    customerName: "", 
    email: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => { if (!p) navigate("/products"); else setProduct(p); });
    const unsub = subscribeToProductReviews(id, setReviews);
    return unsub;
  }, [id]);

  useEffect(() => {
    // ملء بيانات العميل تلقائياً إذا كان مسجلاً للدخول تسهيلاً عليه
    if (user && profile) {
      setReviewForm(prev => ({
        ...prev,
        customerName: profile.name || "",
        email: user.email || ""
      }));
    }
  }, [user, profile]);

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "5rem", color: "#C9A96E", fontSize: "1.5rem" }}>جاري التحميل...</div>
    </div>
  );

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment || !reviewForm.customerName || !reviewForm.email) {
      alert("الرجاء ملء جميع الحقول المطلوبة! ⚠️");
      return;
    }
    setSubmitting(true);
    await addReview({
      productId: id,
      userId: user?.uid || "guest",
      userName: reviewForm.customerName,
      email: reviewForm.email,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      featured: false, // الأدمن يتحكم في عرضه بالرئيسية لاحقاً
      imageUrl: "",    // الأدمن يضيف الصورة من لوحة التحكم
    });
    
    setReviewForm({ rating: 5, comment: "", customerName: user ? profile?.name || "" : "", email: user ? user.email || "" : "" });
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#C9A96E", cursor: "pointer", fontSize: "1rem", marginBottom: "1rem", fontWeight: "600" }}>← رجوع</button>

        {/* Product */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          <div style={{ flex: 1, minWidth: "280px", height: "380px", background: "#fff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            {product.imageUrl
              ? <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "🕯️"}
          </div>

          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {product.isNew && <span style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem" }}>جديد</span>}
              {product.isBestSeller && <span style={{ background: "#3D2B1F", color: "#C9A96E", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem" }}>⭐ الأكثر مبيعاً</span>}
            </div>
            <h1 style={{ color: "#3D2B1F", fontSize: "1.8rem", marginBottom: "8px", fontWeight: "800" }}>{field(product, "name")}</h1>

            {avgRating && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ color: "#C9A96E", fontSize: "1.2rem" }}>{"⭐".repeat(Math.round(avgRating))}</span>
                <span style={{ color: "#8B7355", fontWeight: "600" }}>{avgRating} ({reviews.length} تقييم)</span>
              </div>
            )}

            <p style={{ color: "#C9A96E", fontSize: "2rem", fontWeight: "800", marginBottom: "16px" }}>{product.price} {t.currency}</p>
            <p style={{ color: "#8B7355", lineHeight: "1.8", marginBottom: "24px" }}>{field(product, "desc")}</p>
            <p style={{ color: product.stock > 0 ? "#4CAF50" : "#cc0000", marginBottom: "16px", fontWeight: "600" }}>
              {product.stock > 0 ? `✅ متوفر (${product.stock} قطعة)` : "❌ نفذت الكمية"}
            </p>

            {product.stock > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #E8DDD0", background: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>-</button>
                <span style={{ fontWeight: "700", fontSize: "1.2rem", minWidth: "30px", textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #E8DDD0", background: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>+</button>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleAdd} disabled={product.stock === 0} style={{ flex: 1, background: added ? "#4CAF50" : "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 15px rgba(201,169,110,0.3)" }}>
                {added ? "✓ تمت الإضافة" : t.products.addToCart}
              </button>
              <button onClick={() => toggleWishlist(product)} style={{ background: "#fff", border: "2px solid #E8DDD0", borderRadius: "12px", padding: "14px 18px", cursor: "pointer", fontSize: "1.3rem" }}>
                {isInWishlist(product.id) ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ background: "#fff", borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #E8DDD0" }}>
          
          {/* عرض التقييمات الحالية فوق الـ Form */}
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ color: "#3D2B1F", borderBottom: "1px solid #E8DDD0", paddingBottom: "12px", fontSize: "1.3rem", fontWeight: "700", marginBottom: "1.5rem" }}>
              التقييمات ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p style={{ color: "#777", fontSize: "0.95rem" }}>لا توجد مراجعات حتى الآن.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ borderBottom: "1px solid #FAF8F5", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div>
                        <strong style={{ fontSize: "0.95rem", color: "#3D2B1F" }}>{review.userName}</strong>
                        <span style={{ marginRight: "10px", color: "#C9A96E", fontSize: "1.1rem" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                      </div>
                      <span style={{ color: "#8B7355", fontSize: "0.85rem" }}>
                        {review.createdAt?.toDate?.()?.toLocaleDateString("ar-EG") || ""}
                      </span>
                    </div>
                    <p style={{ margin: "5px 0 0 0", color: "#555", fontSize: "0.9rem", lineHeight: "1.6" }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* فورم كتابة مراجعة جديدة متطابق تماماً مع ستايل BoHouse */}
          <form onSubmit={handleReview} style={{ borderTop: "2px solid #FAF8F5", paddingTop: "2rem" }}>
            <h3 style={{ color: "#3D2B1F", margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: "700" }}>
              كن أول من يكتب مراجعة لـ "{field(product, 'name')}"
            </h3>
            <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "2rem" }}>
              *الحقول المطلوبة مشار إليها بعلامة * لن يتم نشر عنوان بريدك الإلكتروني.
            </p>

            {/* النجوم بتصميم تفاعلي جذاب */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", fontSize: "0.9rem", color: "#3D2B1F" }}>*تقييمك</label>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })} 
                    style={{ fontSize: "1.6rem", cursor: "pointer", color: star <= reviewForm.rating ? "#C9A96E" : "#ccc", transition: "color 0.15s" }}
                  >
                    {star <= reviewForm.rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </div>

            {/* مربع نص المراجعة الكبير */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", fontSize: "0.9rem", color: "#3D2B1F" }}>*مراجعتك</label>
              <textarea 
                rows="6"
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "Cairo", fontSize: "0.95rem" }}
              />
            </div>

            {/* خانات الاسم والإيميل المزدوجة */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", fontSize: "0.9rem", color: "#3D2B1F" }}>*الاسم</label>
                <input 
                  type="text" 
                  required
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", fontSize: "0.95rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", fontSize: "0.9rem", color: "#3D2B1F" }}>*البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", fontSize: "0.95rem" }}
                />
              </div>
            </div>

            {/* زرار الإرسال الفخم لـ LEMO */}
            <button 
              type="submit" 
              disabled={submitting}
              style={{ background: "#111", color: "#fff", border: "none", padding: "12px 35px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.95rem", transition: "background 0.2s" }}
            >
              {submitted ? "✓ تم الإرسال!" : submitting ? "جاري الإرسال..." : "تقديم"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}