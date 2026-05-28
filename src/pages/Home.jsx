import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToBanners, getSettings, subscribeToCategories, subscribeToProducts } from "../firebase/settings";

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
      setSettings(data);
      setGlobalLoading(false);
    });
    return () => { unsubBanners(); unsubCats(); unsubProds(); };
  }, [lang]);

  if (globalLoading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري التحميل...</div>;

  const heroBanner = banners.find(b => b.sectionKey === 'hero') || {};
  const bestSellers = products.filter(p => p.isBestSeller === true);
  const newProducts = products.filter(p => p.isNew === true);

  // صورة القوس الافتراضية لو مفيش صورة مرفوعة
  const defaultArchImg = "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=800"; 

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", width: "220px", margin: "1rem" }}>
      <img 
        src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} 
        style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "10px" }} 
        alt=""
      />
      <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>{field(product, "name")}</h3>
      <p style={{ color: "#C9A96E", fontWeight: "bold" }}>{product.price} ج.م</p>
      {settings?.showStock !== false && <p style={{ fontSize: "0.8rem", color: "#888" }}>المتبقي: {product.stock}</p>}
    </Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      {/* ─── البانر الرئيسي الفخم بتصميم القوس ─── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "4rem 8%", minHeight: "65vh", position: "relative" }}>
        
        {/* النصوص (يمين) */}
        <div style={{ flex: "1 1 400px", zIndex: 2 }}>
          <h2 style={{ fontSize: "2.5rem", color: "#6e4f3a", fontWeight: "900", marginBottom: "0.5rem", fontFamily: "Arial, sans-serif" }}>
            {lang === "ar" ? (heroBanner.titleAr || "Lemo Store") : (heroBanner.titleEn || "Lemo Store")}
          </h2>
          <h1 style={{ fontSize: "4rem", color: "#111", fontWeight: "900", lineHeight: "1.2", marginBottom: "1rem" }}>
            {lang === "ar" ? (<span>الشموع الفاخرة<br/>والديكور</span>) : (<span>Luxury Candles<br/>& Decor</span>)}
          </h1>
          <p style={{ color: "#888", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: "1.8", maxWidth: "80%" }}>
            {lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك." : "Discover our unique collection handcrafted from the finest aromatic materials, completely safe for your home and family."}
          </p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "12px 30px", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem", display: "inline-block" }}>
            {lang === "ar" ? "تسوق الآن" : "Shop Now"}
          </Link>
        </div>

        {/* صورة القوس (يسار) */}
        <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", position: "relative", marginTop: "2rem" }}>
          {/* نجوم ديكور */}
          <div style={{ position: "absolute", top: "10%", right: "15%", fontSize: "2rem", color: "#111" }}>✦</div>
          <div style={{ position: "absolute", bottom: "25%", left: "10%", fontSize: "1.5rem", color: "#111" }}>✦</div>
          
          <div style={{ position: "relative", width: "340px", height: "450px", border: "1px solid #111", borderRadius: "170px 170px 0 0", padding: "12px", background: "transparent" }}>
            <img 
              src={heroBanner.imageUrl || defaultArchImg} 
              alt="Hero" 
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "158px 158px 0 0" }} 
            />
            {/* أيقونة الديكور المخططة */}
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "80px", height: "80px", background: "repeating-linear-gradient(45deg, transparent, transparent 5px, #888 5px, #888 6px)", borderRadius: "50%", zIndex: -1 }}></div>
          </div>
        </div>
      </div>

      {/* ─── شريط الكلمات المتحرك النحيف ─── */}
      <div style={{ borderTop: "1px solid #E8DDD0", borderBottom: "1px solid #E8DDD0", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100%", fontSize: "0.85rem", fontWeight: "800", color: "#3D2B1F" }}>
        <div style={{ display: "inline-block", animation: "marquee 40s linear infinite" }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ margin: "0 15px", textTransform: "uppercase", letterSpacing: "3px" }}>
              SPECIAL GIFTS ✦ PACKAGES ✦ OFFERS ✦ BUNDLES ✦ CANDLES ✦ HOME DECOR ✦ MERCHANDISE ✦ BODY ESSENTIALS ✦
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ─── شريط الشحن الذهبي ─── */}
      <div style={{ background: "#C9A96E", color: "#fff", textAlign: "center", padding: "12px", fontSize: "0.95rem", fontWeight: "700" }}>
        🚚 شحن مجاني على الطلبات فوق 2000 ج.م | 🎁 تغليف هدايا مجاني فاخر
      </div>

      {/* ─── تصفح الأقسام ─── */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#111", marginBottom: "3rem" }}>{lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {bestSellers.length > 0 ? bestSellers.map(p => <ProductCard key={p.id} product={p} />) : <p>لا توجد منتجات مميزة</p>}
        </div>
      </div>

    </div>
  );
}