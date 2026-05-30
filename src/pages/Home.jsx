import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToBanners, getSettings, subscribeToCategories } from "../firebase/settings"; 
import { subscribeToProducts } from "../firebase/products";

export default function Home() {
  const { field, lang } = useLang();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const unsubBanners = subscribeToBanners((data) => setBanners(data));
    const unsubCats = subscribeToCategories((data) => setCategories(data)); 
    const unsubProds = subscribeToProducts((data) => setProducts(data));
    getSettings().then((data) => { 
      setSettings(data || {}); 
      setGlobalLoading(false); 
    });
    return () => { unsubBanners(); unsubCats(); unsubProds(); };
  }, []);

  if (globalLoading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif" }}>
      جاري تحميل Lemo Store...
    </div>
  );

  const heroBanner = banners.find(b => b.sectionKey === "hero") || {};
  const bestSellers = products.filter(p => p.isBestSeller === true || p.bestSeller === true);
  const defaultArchImg = "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=800";

  // 🛠️ ربط النصوص بالمتغيرات اللي ضفناها في AdminSettings
  const heroTitle = lang === "ar" ? (settings?.heroTitle || "LEMO STORE… بنبيع إحساس مش منتجات") : (settings?.heroTitleEn || "Lemo Store... Selling feelings, not just products");
  const heroDesc = lang === "ar" ? (settings?.heroDesc || "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك.") : (settings?.heroDescEn || "Discover our unique collection handcrafted from the finest aromatic materials, completely safe for your home and family.");

  const ProductCard = ({ product }) => (
    <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", width: "220px" }}>
      <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "#fff", transition: "transform 0.3s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
        <img src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : (product.imageUrl || product.image)} style={{ width: "100%", height: "220px", objectFit: "cover" }} alt="" />
        <div style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem", color: "#111" }}>{field(product, "name")}</h3>
          <p style={{ color: "#C9A96E", fontWeight: "800", margin: 0 }}>{product.price} ج.م</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* Hero Section */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "4rem 8%", minHeight: "65vh", position: "relative" }}>
        <div style={{ flex: "1 1 400px", zIndex: 2 }}>
          <h2 style={{ fontSize: "2rem", color: "#6e4f3a", fontWeight: "900", marginBottom: "0.5rem" }}>Lemo Store</h2>
          <h1 style={{ fontSize: "3.5rem", color: "#111", fontWeight: "900", lineHeight: "1.2", marginBottom: "1rem" }}>{heroTitle}</h1>
          <p style={{ color: "#888", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: "1.8", maxWidth: "85%" }}>{heroDesc}</p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "14px 36px", borderRadius: "30px", textDecoration: "none", fontWeight: "bold" }}>
            {lang === "ar" ? "تسوق الآن" : "Shop Now"}
          </Link>
        </div>
        <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", position: "relative", marginTop: "2rem" }}>
          <div style={{ position: "relative", width: "340px", height: "450px", border: "1px solid #111", borderRadius: "170px 170px 0 0", padding: "12px" }}>
            <img src={heroBanner.imageUrl || defaultArchImg} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "158px 158px 0 0" }} />
          </div>
        </div>
      </div>

      {/* 🛠️ الشريط المتحرك (إنجليزي دائماً) */}
      <div style={{ background: "#fff", padding: "20px 0", overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid #E8DDD0", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ display: "inline-block", animation: "marquee 25s linear infinite" }}>
            {[...categories, ...categories, ...categories].map((cat, i) => (
              <span key={i} style={{ margin: "0 40px", fontWeight: "800", color: "#3D2B1F", fontSize: "1.1rem", textTransform: "uppercase" }}>
                ✦ {cat.nameEn || cat.nameAr}
              </span>
            ))}
        </div>
      </div>

      {/* 🛠️ Promo Bar المربوط بالإعدادات */}
      <div style={{ background: "#C9A96E", color: "#fff", textAlign: "center", padding: "12px", fontSize: "0.95rem", fontWeight: "700" }}>
        {lang === "ar" ? (
          <>🚚 شحن مجاني على الطلبات فوق {settings?.freeShippingLimit || 500} ج.م | 🎁 تغليف هدايا فاخر بـ {settings?.giftFee || 50} ج.م فقط</>
        ) : (
          <>🚚 Free Shipping on orders over {settings?.freeShippingLimit || 500} EGP | 🎁 Luxury Gift Wrapping for just {settings?.giftFee || 50} EGP</>
        )}
      </div>

      {/* Categories Section */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "3rem" }}>{lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug || cat.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ width: "180px", height: "240px", borderRadius: "100px 100px 0 0", overflow: "hidden", border: "1px solid #E8DDD0", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <img src={cat.imageUrl || "https://via.placeholder.com/200"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
              <h3 style={{ marginTop: "1.2rem", fontWeight: "700" }}>{field(cat, "name")}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <div style={{ padding: "3rem 2rem", background: "#fff", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "3rem" }}>{lang === "ar" ? "⭐ الأكثر مبيعاً" : "⭐ Best Sellers"}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <footer style={{ background: "#111", color: "#fff", padding: "3rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>🕯️ Lemo Store</p>
        <p style={{ opacity: 0.5, fontSize: "0.8rem", marginTop: "10px" }}>© 2026 جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}