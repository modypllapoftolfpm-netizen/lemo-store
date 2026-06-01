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

  const heroTitle = lang === "ar" ? (settings?.heroTitle || "LEMO STORE… بنبيع إحساس مش منتجات") : (settings?.heroTitleEn || "Lemo Store... Selling feelings, not just products");
  const heroDesc = lang === "ar" ? (settings?.heroDesc || "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك.") : (settings?.heroDescEn || "Discover our unique collection handcrafted from the finest aromatic materials, completely safe for your home and family.");

  const ProductCard = ({ product }) => (
    <Link to={`/products/${product.id}`} className="product-card" style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", background: "#fff", transition: "transform 0.3s", height: "100%" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
        <img className="product-img" src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : (product.imageUrl || product.image)} alt="" style={{ width: "100%", objectFit: "cover" }} />
        <div className="product-details" style={{ padding: "12px" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "0.95rem", color: "#111", lineHeight: "1.4", height: "40px", overflow: "hidden" }}>{field(product, "name")}</h3>
          <p style={{ color: "#C9A96E", fontWeight: "800", margin: 0, fontSize: "1rem" }}>{product.price} ج.م</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif", overflowX: "hidden" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      {/* 📱 أكواد التجاوب مع الموبايل (Responsive CSS) */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* إعدادات الديسكتوب الافتراضية */
        .hero-container { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: 4rem 8%; min-height: 65vh; }
        .hero-title { font-size: 3.5rem; font-weight: 900; line-height: 1.2; margin-bottom: 1rem; color: #111; }
        .hero-desc { font-size: 1.1rem; margin-bottom: 2.5rem; line-height: 1.8; color: #888; max-width: 85%; }
        .cats-container, .prods-container { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
        .product-card { width: 220px; }
        .product-img { height: 220px; }
        .section-title { font-size: 2.5rem; }

        /* 📱 إعدادات الموبايل (شاشات أصغر من 768px) */
        @media (max-width: 768px) {
          .hero-container { padding: 2rem 5%; flex-direction: column; text-align: center; }
          .hero-title { font-size: 2.2rem; }
          .hero-desc { max-width: 100%; font-size: 1rem; margin: 0 auto 2rem auto; }
          .hero-image-box { width: 100% !important; max-width: 300px; margin: 2rem auto 0 auto !important; }
          
          .section-title { font-size: 1.8rem; margin-bottom: 2rem !important; }
          
          /* شبكة الأقسام: تصغير الحجم لتناسب الموبايل */
          .cats-container { gap: 1rem; }
          .cat-card-wrapper { width: 130px !important; height: 180px !important; }
          
          /* 🛒 شبكة المنتجات: منتجين في الصف الواحد زي أمازون */
          .prods-container { 
            display: grid !important; 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 12px !important; 
            padding: 0 10px;
          }
          .product-card { width: 100% !important; }
          .product-img { height: 160px !important; }
          .product-details { padding: 8px !important; }
        }
      `}</style>

      {/* Hero Section */}
      <div className="hero-container">
        <div style={{ flex: "1 1 400px", zIndex: 2 }}>
          <h2 style={{ fontSize: "1.5rem", color: "#6e4f3a", fontWeight: "900", marginBottom: "0.5rem" }}>Lemo Store</h2>
          <h1 className="hero-title">{heroTitle}</h1>
          <p className="hero-desc">{heroDesc}</p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "14px 36px", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}>
            {lang === "ar" ? "تسوق الآن" : "Shop Now"}
          </Link>
        </div>
        <div className="hero-image-box" style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px", height: "450px", border: "1px solid #111", borderRadius: "170px 170px 0 0", padding: "12px", boxSizing: "border-box" }}>
            <img src={heroBanner.imageUrl || defaultArchImg} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "158px 158px 0 0" }} />
          </div>
        </div>
      </div>

      {/* الشريط المتحرك */}
      <div style={{ background: "#fff", padding: "15px 0", overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid #E8DDD0", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ display: "inline-block", animation: "marquee 25s linear infinite" }}>
            {[...categories, ...categories, ...categories].map((cat, i) => (
              <span key={i} style={{ margin: "0 30px", fontWeight: "800", color: "#3D2B1F", fontSize: "1rem", textTransform: "uppercase" }}>
                ✦ {cat.nameEn || cat.nameAr}
              </span>
            ))}
        </div>
      </div>

      {/* Promo Bar */}
      <div style={{ background: "#C9A96E", color: "#fff", textAlign: "center", padding: "10px", fontSize: "0.85rem", fontWeight: "700" }}>
        {settings?.announcementText || (lang === "ar" ? "🚚 شحن مجاني على الطلبات فوق 2000 ج.م | 🎁 تغليف هدايا فاخر بـ 50 ج.م فقط" : "🚚 Free Shipping on orders over 2000 EGP | 🎁 Luxury Gift Wrapping for just 50 EGP")}
      </div>

      {/* Categories Section */}
      <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h2 className="section-title" style={{ fontWeight: "900", marginBottom: "3rem" }}>{lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}</h2>
        <div className="cats-container">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug || cat.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="cat-card-wrapper" style={{ width: "180px", height: "240px", borderRadius: "100px 100px 0 0", overflow: "hidden", border: "1px solid #E8DDD0", transition: "transform 0.3s" }}>
                <img src={cat.imageUrl || "https://via.placeholder.com/200"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
              <h3 style={{ marginTop: "1rem", fontWeight: "700", fontSize: "1.1rem" }}>{field(cat, "name")}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <div style={{ padding: "3rem 0", background: "#fff", textAlign: "center" }}>
          <h2 className="section-title" style={{ fontWeight: "900", marginBottom: "3rem" }}>{lang === "ar" ? "⭐ الأكثر مبيعاً" : "⭐ Best Sellers"}</h2>
          <div className="prods-container">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <footer style={{ background: "#111", color: "#fff", padding: "2rem 1rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>🕯️ Lemo Store</p>
        <p style={{ opacity: 0.5, fontSize: "0.8rem", marginTop: "10px" }}>© 2026 جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}