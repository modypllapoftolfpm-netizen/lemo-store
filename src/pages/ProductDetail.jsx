import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useLang } from "../context/LangContext";
import { getProduct } from "../firebase/products";

export default function ProductDetail() {
  const { id } = useParams();
  const { t, field } = useLang();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => { if (!p) navigate("/products"); else setProduct(p); });
  }, [id]);

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

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none", color: "#C9A96E",
          cursor: "pointer", fontSize: "1rem", marginBottom: "1rem", fontWeight: "600"
        }}>← رجوع</button>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Image */}
          <div style={{
            flex: 1, minWidth: "280px", height: "350px",
            background: "#fff", borderRadius: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "6rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}>
            {product.imageUrl
              ? <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px" }} />
              : "🕯️"}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {product.isNew && <span style={{ background: "#C9A96E", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem" }}>{t.products.new}</span>}
              {product.isBestSeller && <span style={{ background: "#3D2B1F", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem" }}>⭐ {t.products.bestSeller}</span>}
            </div>

            <h1 style={{ color: "#3D2B1F", fontSize: "1.8rem", marginBottom: "8px" }}>{field(product, "name")}</h1>
            <p style={{ color: "#C9A96E", fontSize: "1.8rem", fontWeight: "700", marginBottom: "16px" }}>{product.price} {t.currency}</p>
            <p style={{ color: "#8B7355", lineHeight: "1.7", marginBottom: "24px" }}>{field(product, "desc")}</p>

            <p style={{ color: product.stock > 0 ? "green" : "red", marginBottom: "16px", fontWeight: "600" }}>
              {product.stock > 0 ? `✅ ${t.products.inStock} (${product.stock})` : `❌ ${t.products.outOfStock}`}
            </p>

            {product.stock > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #E8DDD0", background: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>-</button>
                <span style={{ fontWeight: "700", fontSize: "1.2rem" }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #E8DDD0", background: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>+</button>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleAdd} disabled={product.stock === 0} style={{
                flex: 1, background: added ? "#8B7355" : "#C9A96E",
                color: "#fff", border: "none", borderRadius: "12px",
                padding: "14px", fontSize: "1rem", fontWeight: "700", cursor: "pointer"
              }}>{added ? "✓ تمت الإضافة" : t.products.addToCart}</button>
              <button onClick={() => toggleWishlist(product)} style={{
                background: "#fff", border: "2px solid #E8DDD0",
                borderRadius: "12px", padding: "14px 18px", cursor: "pointer", fontSize: "1.3rem"
              }}>{isInWishlist(product.id) ? "❤️" : "🤍"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}