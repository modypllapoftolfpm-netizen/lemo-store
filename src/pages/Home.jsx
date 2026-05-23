import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { t, field } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const unsub = subscribeToProducts(setProducts);
    return unsub;
  }, []);

  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #3D2B1F 0%, #C9A96E 100%)",
        padding: "5rem 2rem",
        textAlign: "center",
        color: "#fff"
      }}>
        <h1 style={{ fontSize: "3.5rem", fontFamily: "serif", margin: "0 0 1rem" }}>🕯️ LEMO Store</h1>
        <p style={{ fontSize: "1.3rem", opacity: 0.9, marginBottom: "2rem" }}>
          شموع فاخرة وهدايا مميزة
        </p>
        <Link to="/products" style={{
          background: "#fff", color: "#C9A96E",
          padding: "14px 40px", borderRadius: "30px",
          textDecoration: "none", fontWeight: "700", fontSize: "1.1rem"
        }}>{t.home.shopNow}</Link>
      </div>

      {/* Categories */}
      <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <h2 style={{ color: "#3D2B1F", fontSize: "2rem", marginBottom: "2rem" }}>{t.home.exploreCategories}</h2>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { key: "gifts", icon: "🎁" },
            { key: "scented", icon: "🕯️" },
            { key: "decorative", icon: "✨" },
            { key: "body", icon: "🧴" },
          ].map((cat) => (
            <Link key={cat.key} to={`/products?category=${cat.key}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", border: "2px solid #E8DDD0",
                borderRadius: "16px", padding: "1.5rem 2rem",
                cursor: "pointer", transition: "all 0.3s",
                minWidth: "140px"
              }}>
                <div style={{ fontSize: "2.5rem" }}>{cat.icon}</div>
                <div style={{ color: "#3D2B1F", fontWeight: "600", marginTop: "8px" }}>
                  {t.categories[cat.key]}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <div style={{ padding: "2rem", background: "#fff" }}>
          <h2 style={{ textAlign: "center", color: "#3D2B1F", fontSize: "2rem", marginBottom: "2rem" }}>
            ⭐ {t.home.bestSellers}
          </h2>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div style={{ padding: "2rem" }}>
          <h2 style={{ textAlign: "center", color: "#3D2B1F", fontSize: "2rem", marginBottom: "2rem" }}>
            ✨ {t.home.newArrivals}
          </h2>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: "#3D2B1F", color: "#E8DDD0",
        textAlign: "center", padding: "2rem",
        marginTop: "3rem"
      }}>
        <p style={{ fontSize: "1.5rem", marginBottom: "8px" }}>🕯️ LEMO Store</p>
        <p style={{ opacity: 0.7 }}>© 2026 جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

function ProductCard({ product, field, t, addToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{
      background: "#fff", borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      width: "220px", overflow: "hidden",
      transition: "transform 0.3s",
    }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{
          height: "200px", background: "#FAF7F2",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "4rem"
        }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🕯️"}
        </div>
        <div style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 8px", color: "#3D2B1F", fontSize: "1rem" }}>
            {field(product, "name")}
          </h3>
          <p style={{ color: "#C9A96E", fontWeight: "700", margin: "0 0 12px" }}>
            {product.price} {t.currency}
          </p>
        </div>
      </Link>
      <div style={{ padding: "0 1rem 1rem" }}>
        <button onClick={handleAdd} style={{
          width: "100%", background: added ? "#8B7355" : "#C9A96E",
          color: "#fff", border: "none", borderRadius: "10px",
          padding: "10px", cursor: "pointer", fontWeight: "600",
          transition: "background 0.3s"
        }}>
          {added ? "✓ تمت الإضافة" : t.products.addToCart}
        </button>
      </div>
    </div>
  );
}