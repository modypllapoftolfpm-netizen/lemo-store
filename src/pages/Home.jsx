import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToBanners } from "../firebase/settings";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { t, field, lang } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const unsub1 = subscribeToProducts(setProducts);
    const unsub2 = subscribeToBanners(setBanners);
    return () => { unsub1(); unsub2(); };
  }, []);

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
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: lang === "ar" ? "Cairo, sans-serif" : "DM Sans, sans-serif" }}>
      <Navbar />

      {/* Hero Banner */}
      <div style={{ position: "relative", height: "520px", overflow: "hidden" }}>
        {banners.length > 0 ? (
          <>
            <img src={banners[currentBanner]?.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.5s" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(61,43,31,0.7))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "4rem", color: "#fff", textAlign: "center" }}>
              <h1 style={{ fontSize: "3.5rem", fontWeight: "800", margin: "0 0 1rem", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                {banners[currentBanner]?.titleAr || "🕯️ LEMO Store"}
              </h1>
              <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "2rem", maxWidth: "500px" }}>
                {banners[currentBanner]?.subtitleAr || "شموع فاخرة وهدايا مميزة"}
              </p>
              <Link to="/products" style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "14px 40px", borderRadius: "30px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem", boxShadow: "0 8px 25px rgba(201,169,110,0.4)" }}>
                {t.home.shopNow} ✨
              </Link>
            </div>
            {banners.length > 1 && (
              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)} style={{ width: i === currentBanner ? "28px" : "8px", height: "8px", borderRadius: "4px", background: i === currentBanner ? "#C9A96E" : "rgba(255,255,255,0.6)", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ height: "100%", background: "linear-gradient(135deg, #3D2B1F 0%, #6B4C3B 50%, #C9A96E 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🕯️</div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: "800", margin: "0 0 1rem" }}>LEMO Store</h1>
            <p style={{ fontSize: "1.3rem", opacity: 0.85, marginBottom: "2rem" }}>شموع فاخرة وهدايا مميزة لكل مناسبة</p>
            <Link to="/products" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", padding: "14px 40px", borderRadius: "30px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem" }}>
              {t.home.shopNow} ✨
            </Link>
          </div>
        )}
      </div>

      {/* Free Shipping Banner */}
      <div style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", padding: "12px", textAlign: "center", color: "#fff", fontSize: "0.95rem", fontWeight: "600" }}>
        🚚 شحن مجاني على الطلبات فوق 500 ج.م | 🎁 تغليف هدايا مجاني
      </div>

      {/* Categories */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <p style={{ color: "#C9A96E", fontWeight: "700", letterSpacing: "2px", fontSize: "0.85rem", marginBottom: "8px", textTransform: "uppercase" }}>تسوقي حسب</p>
        <h2 style={{ color: "#3D2B1F", fontSize: "2.2rem", fontWeight: "800", marginBottom: "2.5rem", marginTop: 0 }}>{t.home.exploreCategories}</h2>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
          {[
            { key: "gifts", icon: "🎁", bg: "#FFF8F0" },
            { key: "scented", icon: "🕯️", bg: "#F0F8FF" },
            { key: "decorative", icon: "✨", bg: "#FFF0F8" },
            { key: "body", icon: "🧴", bg: "#F0FFF8" },
          ].map((cat) => (
            <Link key={cat.key} to={`/products?category=${cat.key}`} style={{ textDecoration: "none", flex: "1", minWidth: "150px", maxWidth: "200px" }}>
              <div style={{ background: cat.bg, border: "2px solid #E8DDD0", borderRadius: "20px", padding: "2rem 1rem", cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(201,169,110,0.2)"; e.currentTarget.style.borderColor = "#C9A96E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E8DDD0"; }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{cat.icon}</div>
                <div style={{ color: "#3D2B1F", fontWeight: "700", fontSize: "0.95rem" }}>{t.categories[cat.key]}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <div style={{ padding: "3rem 2rem", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: "#C9A96E", fontWeight: "700", letterSpacing: "2px", fontSize: "0.85rem", marginBottom: "8px" }}>⭐ BEST SELLERS</p>
            <h2 style={{ color: "#3D2B1F", fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>{t.home.bestSellers}</h2>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", maxWidth: "1100px", margin: "0 auto" }}>
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/products" style={{ border: "2px solid #C9A96E", color: "#C9A96E", padding: "12px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "700" }}>
              {t.viewAll} ←
            </Link>
          </div>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div style={{ padding: "3rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: "#C9A96E", fontWeight: "700", letterSpacing: "2px", fontSize: "0.85rem", marginBottom: "8px" }}>✨ NEW IN</p>
            <h2 style={{ color: "#3D2B1F", fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>{t.home.newArrivals}</h2>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", maxWidth: "1100px", margin: "0 auto" }}>
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} />)}
          </div>
        </div>
      )}

      {/* Why Us */}
      <div style={{ background: "#3D2B1F", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ color: "#C9A96E", fontSize: "2rem", fontWeight: "800", marginBottom: "2.5rem" }}>ليه LEMO Store؟</h2>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
          {[
            { icon: "🕯️", title: "جودة فاخرة", desc: "منتجات مصنوعة بعناية من أجود الخامات" },
            { icon: "🎁", title: "تغليف مميز", desc: "كل طلب يوصلك في تغليف هدايا أنيق" },
            { icon: "🚚", title: "توصيل سريع", desc: "توصيل لكل أنحاء مصر" },
            { icon: "💛", title: "ضمان الجودة", desc: "رضاكم أولويتنا دايماً" },
          ].map((item) => (
            <div key={item.title} style={{ flex: "1", minWidth: "180px", maxWidth: "200px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{item.icon}</div>
              <h3 style={{ color: "#fff", fontWeight: "700", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ color: "#D4B896", fontSize: "0.9rem", margin: 0, lineHeight: "1.6" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#2C1810", color: "#E8DDD0", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px" }}>🕯️ LEMO Store</p>
        <p style={{ opacity: 0.6, fontSize: "0.9rem", margin: 0 }}>© 2026 جميع الحقوق محفوظة — صُنع بـ ❤️ في مصر</p>
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
    <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", width: "230px", overflow: "hidden", transition: "transform 0.3s, box-shadow 0.3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(201,169,110,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{ height: "220px", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative", overflow: "hidden" }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🕯️"}
          {product.isNew && <span style={{ position: "absolute", top: "12px", right: "12px", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>جديد</span>}
          {product.isBestSeller && <span style={{ position: "absolute", top: "12px", left: "12px", background: "#3D2B1F", color: "#C9A96E", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>⭐</span>}
        </div>
        <div style={{ padding: "1rem 1.2rem 0.5rem" }}>
          <h3 style={{ margin: "0 0 6px", color: "#3D2B1F", fontSize: "1rem", fontWeight: "700" }}>{field(product, "name")}</h3>
          <p style={{ color: "#C9A96E", fontWeight: "800", margin: 0, fontSize: "1.1rem" }}>{product.price} {t.currency}</p>
        </div>
      </Link>
      <div style={{ padding: "0.8rem 1.2rem 1.2rem" }}>
        <button onClick={handleAdd} style={{ width: "100%", background: added ? "#4CAF50" : "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", borderRadius: "12px", padding: "10px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem", transition: "all 0.3s", boxShadow: "0 4px 15px rgba(201,169,110,0.3)" }}>
          {added ? "✓ تمت الإضافة" : t.products.addToCart}
        </button>
      </div>
    </div>
  );
}