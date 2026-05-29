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
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const unsubBanners = subscribeToBanners((data) => setBanners(data));
    const unsubCats = subscribeToCategories((data) => setCategories(data)); 
    const unsubProds = subscribeToProducts((data) => setProducts(data));
    getSettings().then((data) => { setSettings(data || {}); setGlobalLoading(false); });
    return () => { unsubBanners(); unsubCats(); unsubProds(); };
  }, []);

  if (globalLoading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif" }}>
      جاري التحميل...
    </div>
  );

  const heroBanner = banners.find(b => b.sectionKey === "hero") || {};
  const bestSellers = products.filter(p => p.isBestSeller === true || p.bestSeller === true || p.bestSeller === "true");
  const newProducts = products.filter(p => p.isNew === true);
  const defaultArchImg = "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=800";

  // استدعاء نصوص الهيرو من الإعدادات
  const heroTitle = lang === "ar" ? (settings?.heroTitleAr || "الشموع الفاخرة والديكور") : (settings?.heroTitleEn || "Luxury Candles & Decor");
  const heroDesc = lang === "ar" ? (settings?.heroDescAr || "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك.") : (settings?.heroDescEn || "Discover our unique collection handcrafted from the finest aromatic materials, completely safe for your home.");

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
        .lemo-social-btn { display: flex; align-items: center; gap: 12px; padding: 12px 20px; text-decoration: none; color: #333; font-weight: 700; font-size: 0.95rem; background: #FAF8F5; border-radius: 10px; transition: all 0.25s ease; }
        .lemo-social-btn:hover { background: #3D2B1F; color: #fff; }
        .lemo-social-btn:hover svg { fill: #C9A96E !important; transform: scale(1.1); }
        @keyframes popup { from { opacity: 0; transform: scale(0.9) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* Hero Section Dynamic */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "4rem 8%", minHeight: "65vh", position: "relative" }}>
        <div style={{ flex: "1 1 400px", zIndex: 2 }}>
          <h2 style={{ fontSize: "2rem", color: "#6e4f3a", fontWeight: "900", marginBottom: "0.5rem" }}>Lemo Store</h2>
          <h1 style={{ fontSize: "4rem", color: "#111", fontWeight: "900", lineHeight: "1.2", marginBottom: "1rem" }}>
             {heroTitle}
          </h1>
          <p style={{ color: "#888", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: "1.8", maxWidth: "80%" }}>
            {heroDesc}
          </p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "14px 36px", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem" }}>
            {lang === "ar" ? "تسوق الآن" : "Shop Now"}
          </Link>
        </div>

        <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", position: "relative", marginTop: "2rem" }}>
          <div style={{ position: "relative", width: "340px", height: "450px", border: "1px solid #111", borderRadius: "170px 170px 0 0", padding: "12px" }}>
            <img src={heroBanner.imageUrl || defaultArchImg} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "158px 158px 0 0" }} />
          </div>
        </div>
      </div>

      {/* Marquee Bar */}
      <div style={{ background: "#111", padding: "14px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100%", fontSize: "0.85rem", fontWeight: "800", color: "#fff" }}>
        <div style={{ display: "inline-block", animation: "marquee 40s linear infinite" }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ margin: "0 15px", textTransform: "uppercase", letterSpacing: "3px" }}>
              SPECIAL GIFTS <span style={{ color: "#C9A96E" }}>✦</span> OFFERS <span style={{ color: "#C9A96E" }}>✦</span> CANDLES <span style={{ color: "#C9A96E" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Promo Bar Dynamic */}
      <div style={{ background: "#C9A96E", color: "#fff", textAlign: "center", padding: "12px", fontSize: "0.95rem", fontWeight: "700" }}>
        {lang === "ar" ? (
          <>🚚 شحن مجاني على الطلبات فوق {settings?.freeShippingMin || 2000} ج.م | 🎁 {settings?.giftPromoTextAr || "تغليف هدايا مجاني فاخر"}</>
        ) : (
          <>🚚 Free Shipping on orders over {settings?.freeShippingMin || 2000} EGP | 🎁 {settings?.giftPromoTextEn || "Luxury Gift Wrapping Included"}</>
        )}
      </div>

      {/* ... باقي الكود (Categories, Best Sellers, Contact List) كما هو ... */}
    </div>
  );
}