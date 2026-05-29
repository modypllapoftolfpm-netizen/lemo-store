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
  
  // حالة عشان نتحكم في فتح وقفل قائمة التواصل
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

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", width: "220px" }}>
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

  // ستايل أزرار السوشيال ميديا جوه القائمة
  const socialBtnStyle = {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", 
    textDecoration: "none", color: "#111", fontWeight: "600", fontSize: "0.95rem",
    background: "#FAF8F5", borderRadius: "8px", transition: "background 0.3s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      {/* Hero */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "4rem 8%", minHeight: "65vh", position: "relative" }}>
        <div style={{ flex: "1 1 400px", zIndex: 2 }}>
          <h2 style={{ fontSize: "2rem", color: "#6e4f3a", fontWeight: "900", marginBottom: "0.5rem" }}>Lemo Store</h2>
          <h1 style={{ fontSize: "4rem", color: "#111", fontWeight: "900", lineHeight: "1.2", marginBottom: "1rem" }}>
            {lang === "ar" ? <span>الشموع الفاخرة<br />والديكور</span> : <span>Luxury Candles<br />&amp; Decor</span>}
          </h1>
          <p style={{ color: "#888", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: "1.8", maxWidth: "80%" }}>
            {lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك." : "Discover our unique collection handcrafted from the finest aromatic materials, completely safe for your home."}
          </p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "14px 36px", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem" }}>
            {lang === "ar" ? "تسوق الآن" : "Shop Now"}
          </Link>
        </div>

        <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", position: "relative", marginTop: "2rem" }}>
          <div style={{ position: "absolute", top: "10%", right: "15%", fontSize: "2rem", color: "#111" }}>✦</div>
          <div style={{ position: "absolute", bottom: "25%", left: "10%", fontSize: "1.5rem", color: "#111" }}>✦</div>
          <div style={{ position: "relative", width: "340px", height: "450px", border: "1px solid #111", borderRadius: "170px 170px 0 0", padding: "12px", background: "transparent" }}>
            <img src={heroBanner.imageUrl || defaultArchImg} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "158px 158px 0 0" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "80px", height: "80px", background: "repeating-linear-gradient(45deg, transparent, transparent 5px, #ccc 5px, #ccc 6px)", borderRadius: "50%", zIndex: -1 }}></div>
          </div>
        </div>
      </div>

      {/* شريط أسود متحرك */}
      <div style={{ background: "#111", padding: "14px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100%", fontSize: "0.85rem", fontWeight: "800", color: "#fff" }}>
        <div style={{ display: "inline-block", animation: "marquee 40s linear infinite" }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ margin: "0 15px", textTransform: "uppercase", letterSpacing: "3px" }}>
              SPECIAL GIFTS <span style={{ color: "#C9A96E" }}>✦</span> PACKAGES <span style={{ color: "#C9A96E" }}>✦</span> OFFERS <span style={{ color: "#C9A96E" }}>✦</span> BUNDLES <span style={{ color: "#C9A96E" }}>✦</span> CANDLES <span style={{ color: "#C9A96E" }}>✦</span> HOME DECOR <span style={{ color: "#C9A96E" }}>✦</span> BODY ESSENTIALS <span style={{ color: "#C9A96E" }}>✦</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* شريط ذهبي */}
      <div style={{ background: "#C9A96E", color: "#fff", textAlign: "center", padding: "12px", fontSize: "0.95rem", fontWeight: "700" }}>
        🚚 شحن مجاني على الطلبات فوق {settings?.freeShippingMin || 2000} ج.م | 🎁 تغليف هدايا مجاني فاخر
      </div>

      {/* تصفح الأقسام - Arch Style ديناميكي */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#111", marginBottom: "3rem" }}>
          {lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {categories.length > 0 ? categories.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug || cat.id}`} style={{ textDecoration: "none", color: "inherit", textAlign: "center" }}>
              <div style={{ 
                width: "180px", height: "240px", border: "1px solid #E8DDD0", 
                borderRadius: "100px 100px 0 0", padding: "8px", background: "#fff", 
                margin: "0 auto", boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <img src={cat.imageUrl || cat.image || "https://via.placeholder.com/200"} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "90px 90px 0 0" }} alt={field(cat, "name")} />
              </div>
              <h3 style={{ marginTop: "1.2rem", color: "#111", fontWeight: "700", fontSize: "1.1rem" }}>{field(cat, "name")}</h3>
            </Link>
          )) : <p>لا توجد أقسام حالياً.</p>}
        </div>
      </div>

      {/* الأكثر مبيعاً */}
      {bestSellers.length > 0 && (
        <div style={{ padding: "3rem 2rem", background: "#fff", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#111", marginBottom: "3rem" }}>
            {lang === "ar" ? "⭐ الأكثر مبيعاً" : "⭐ Best Sellers"}
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* وصل حديثاً */}
      {newProducts.length > 0 && (
        <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#111", marginBottom: "3rem" }}>
            {lang === "ar" ? "✨ وصل حديثاً" : "✨ New Arrivals"}
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: "#111", color: "#fff", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px" }}>🕯️ LEMO Store</p>
        <p style={{ opacity: 0.5, fontSize: "0.9rem", margin: 0 }}>© 2026 جميع الحقوق محفوظة</p>
      </footer>

      {/* قائمة التواصل العائمة التفاعلية */}
      <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        
        {/* الخيارات اللي بتظهر لما تفتح */}
        {isContactOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", background: "#fff", padding: "12px", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", transformOrigin: "bottom left", animation: "popup 0.3s ease" }}>
            <a href={`https://wa.me/${settings?.whatsapp || "201009633100"}`} target="_blank" rel="noreferrer" style={socialBtnStyle}>
              🟢 واتساب
            </a>
            <a href={settings?.facebook || "https://facebook.com"} target="_blank" rel="noreferrer" style={socialBtnStyle}>
              📘 فيسبوك
            </a>
            <a href={settings?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" style={socialBtnStyle}>
              📸 إنستجرام
            </a>
            <a href={`mailto:${settings?.email || "contact@lemostore.com"}`} style={socialBtnStyle}>
              ✉️ الإيميل
            </a>
          </div>
        )}

        {/* الزرار الرئيسي */}
        <button 
          onClick={() => setIsContactOpen(!isContactOpen)} 
          style={{ background: "#111", color: "#fff", padding: "12px 24px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s" }}>
          {isContactOpen ? "✖ إغلاق" : "💬 تواصل معنا"}
        </button>
        
        {/* أنيميشن خفيف للفتح */}
        <style>{`@keyframes popup { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      </div>

    </div>
  );
}