import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToBanners } from "../firebase/settings";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { t, field } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const unsub1 = subscribeToProducts(setProducts);
    const unsub2 = subscribeToBanners(setBanners);
    return () => { unsub1(); unsub2(); };
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />

      {/* Hero Banner */}
      {banners.length > 0 ? (
        <div style={{ position: "relative", height: "400px", overflow: "hidden" }}>
          <img
            src={banners[currentBanner]?.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center"
          }}>
            <h1 style={{ fontSize: "3rem", fontFamily: "serif", margin: "0 0 1rem" }}>
              {banners[currentBanner]?.titleAr || "🕯️ LEMO Store"}
            </h1>
            <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.9 }}>
              {banners[currentBanner]?.subtitleAr || "شموع فاخرة وهدايا مميزة"}
            </p>
            <Link to="/products" style={{
              background: "#C9A96E", color: "#fff",
              padding: "14px 40px", borderRadius: "30px",
              textDecoration: "none", fontWeight: "700", fontSize: "1.1rem"
            }}>{t.home.shopNow}</Link>
          </div>

          {/* Dots */}
          {banners.length > 1 && (
            <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrentBanner(i)} style={{
                  width: i === currentBanner ? "24px" : "8px",
                  height: "8px", borderRadius: "4px",
                  background: i === currentBanner ? "#C9A96E" : "rgba(255,255,255,0.6)",
                  border: "none", cursor: "pointer", transition: "all 0.3s"
                }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: "linear-gradient(135deg, #3D2B1F 0%, #C9A96E 100%)",
          padding: "5rem 2rem", textAlign: "center", color: "#fff"
        }}>
          <h1 style={{ fontSize: "3.5rem", fontFamily: "serif", margin: "0 0 1rem" }}>🕯️ LEMO Store</h1>
          <p style={{ fontSize: "1.3rem", opacity: 0.9, marginBottom: "2rem" }}>شموع فاخرة وهدايا مميزة</p>
          <Link to="/products" style={{
            background: "#fff", color: "#C9A96E",
            padding: "14px 40px", borderRadius: "30px",
            textDecoration: "none", fontWeight: "700", fontSize: "1.1rem"
          }}>{t.home.shopNow}</Link>
        </div>
      )}

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
                cursor: "pointer", minWidth: "140px"
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
        textAlign: "center", padding: "2rem", marginTop: "3rem"
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
      width: "220px", overflow: "hidden"
    }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{ height: "200px", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🕯️"}
        </div>
        <div style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 8px", color: "#3D2B1F", fontSize: "1rem" }}>{field(product, "name")}</h3>
          <p style={{ color: "#C9A96E", fontWeight: "700", margin: "0 0 12px" }}>{product.price} {t.currency}</p>
        </div>
      </Link>
      <div style={{ padding: "0 1rem 1rem" }}>
        <button onClick={handleAdd} style={{
          width: "100%", background: added ? "#8B7355" : "#C9A96E",
          color: "#fff", border: "none", borderRadius: "10px",
          padding: "10px", cursor: "pointer", fontWeight: "600"
        }}>
          {added ? "✓ تمت الإضافة" : t.products.addToCart}
        </button>
      </div>
    </div>
  );
}