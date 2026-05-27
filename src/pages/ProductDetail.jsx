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
  
  // حالات للتعامل مع التقييم والصورة
  const [file, setFile] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", customerName: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => { if (!p) navigate("/products"); else setProduct(p); });
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

  // دالة الرفع الآمنة على Cloudinary (لا تحتاج API Secret)
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lemo_reviews"); // اسم الـ Preset
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dakjxjp0l/image/upload`, // الـ Cloud Name الخاص بك
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) return data.secure_url;
      else {
        console.error("Cloudinary Error:", data);
        return null;
      }
    } catch (error) {
      console.error("Upload Error:", error);
      return null;
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    let imageUrl = "";
    if (file) {
      imageUrl = await uploadToCloudinary(file);
      if (!imageUrl) {
        alert("فشل رفع الصورة، يرجى المحاولة مرة أخرى");
        setSubmitting(false);
        return;
      }
    }

    await addReview({ 
      productId: id, 
      userId: user?.uid || "guest", 
      ...reviewForm, 
      featured: false, 
      imageUrl: imageUrl 
    });
    
    setReviewForm({ rating: 5, comment: "", customerName: "", email: "" });
    setFile(null);
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <div style={{ minHeight: "100vh", background: "#FAF7F2" }}><Navbar /><div style={{ textAlign: "center", padding: "5rem" }}>جاري التحميل...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#C9A96E", cursor: "pointer", marginBottom: "1rem", fontWeight: "bold" }}>← رجوع</button>
        
        <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          <div style={{ flex: 1, minWidth: "300px", height: "450px", background: "#fff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px" }} />
          </div>

          <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 style={{ color: "#3D2B1F", margin: "0 0 10px 0", fontSize: "2.2rem" }}>{field(product, "name")}</h1>
            <p style={{ color: "#C9A96E", fontSize: "2rem", fontWeight: "900", margin: "0 0 15px 0" }}>{product.price} {t.currency}</p>
            <p style={{ color: "#666", lineHeight: "1.8", fontSize: "1.05rem", marginBottom: "1.5rem" }}>{field(product, "desc")}</p>
            
            <div style={{ display: "flex", gap: "15px", marginBottom: "2rem" }}>
              <button onClick={handleAdd} disabled={product.stock === 0} style={{ flex: 1, padding: "16px", borderRadius: "12px", background: added ? "#4CAF50" : "linear-gradient(135deg, #111, #3D2B1F)", color: "#fff", border: "none", cursor: product.stock === 0 ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>
                {added ? "✓ تمت الإضافة" : t.products.addToCart}
              </button>
            </div>

            {/* نموذج التقييم الجديد */}
            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #E8DDD0" }}>
              <form onSubmit={handleReview}>
                <h3 style={{ margin: "0 0 1rem 0" }}>إضافة تقييم</h3>
                <textarea 
                  required
                  placeholder="اكتب رأيك هنا..." 
                  value={reviewForm.comment} 
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  accept="image/*" 
                  style={{ marginBottom: "10px", display: "block" }}
                />
                <button type="submit" disabled={submitting} style={{ padding: "10px 20px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
                {submitted && <p style={{ color: "green", marginTop: "10px" }}>تم إرسال التقييم بنجاح!</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}