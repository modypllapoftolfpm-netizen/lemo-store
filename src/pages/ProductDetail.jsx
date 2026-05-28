import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getProduct } from "../firebase/products";
import { addReview, subscribeToProductReviews, toggleReviewVisibility } from "../firebase/reviews";

export default function ProductDetail() {
  const { id } = useParams();
  const { field } = useLang();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth(); 
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", customerName: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getProduct(id).then((p) => { if (!p) navigate("/products"); else setProduct(p); });
    const unsub = subscribeToProductReviews(id, setReviews);
    return unsub;
  }, [id]);

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
    alert("تم إرسال التقييم للمراجعة");
  };

  if (!product) return <div style={{ minHeight: "100vh", background: "#FAF8F5" }}><Navbar /><div style={{ textAlign: "center", padding: "5rem" }}>جاري التحميل...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        
        {/* تفاصيل المنتج الرئيسية */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
           <img src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} style={{ width: "100%", borderRadius: "10px" }} />
           <div>
             <h1 style={{ color: "#3D2B1F" }}>{field(product, "name")}</h1>
             <p style={{ fontSize: "1.5rem", color: "#C9A96E", fontWeight: "bold" }}>{product.price} ج.م</p>
             <p style={{ color: "#555" }}>{field(product, "desc")}</p>
             <button onClick={() => addToCart(product)} style={{ background: "#3D2B1F", color: "#fff", padding: "15px 30px", border: "none", borderRadius: "8px", cursor: "pointer" }}>إضافة للسلة</button>
           </div>
        </div>
        
        {/* قسم التقييمات */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px" }}>
            <h3 style={{ color: "#3D2B1F" }}>تقييمات العملاء</h3>
            
            <div style={{ marginTop: "2rem" }}>
              {reviews.filter(rev => rev.visible || isAdmin).map((rev, i) => (
                <div key={i} style={{ borderBottom: "1px solid #eee", padding: "15px", opacity: rev.visible ? 1 : 0.6, background: rev.visible ? "transparent" : "#fcfcfc" }}>
                    <p><strong>{rev.customerName}</strong>: {rev.comment}</p>
                    {rev.imageUrl && <img src={rev.imageUrl} style={{ width: "80px", borderRadius: "5px" }} />}
                    
                    {isAdmin && (
                      <button onClick={() => toggleReviewVisibility(rev.id, rev.visible)} style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer", background: rev.visible ? "#ffcccc" : "#ccffcc", border: "none", borderRadius: "5px" }}>
                        {rev.visible ? "إخفاء التقييم" : "إظهار التقييم"}
                      </button>
                    )}
                </div>
              ))}
            </div>

            <form onSubmit={handleReview} style={{ marginTop: "3rem", borderTop: "2px solid #eee", paddingTop: "2rem" }}>
                <h4 style={{ color: "#3D2B1F" }}>أضف تقييمك الخاص</h4>
                <input placeholder="اسمك" onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="شاركنا رأيك..." style={{ width: "100%", padding: "10px" }} />
                <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: "10px" }} />
                <button type="submit" disabled={submitting} style={{ display: "block", marginTop: "10px", padding: "10px 20px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "5px" }}>
                    {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}