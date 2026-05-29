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

      {/* الـ Styles الخاصة بقائمة التواصل الجديدة والتأثيرات السلسة */}
      <style>{`
        .lemo-social-btn {
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px 20px; 
          text-decoration: none; 
          color: #333; 
          font-weight: 700; 
          font-size: 0.95rem;
          background: #FAF8F5; 
          border-radius: 10px; 
          transition: all 0.25s ease;
        }
        .lemo-social-btn:hover {
          background: #3D2B1F;
          color: #fff;
        }
        .lemo-social-btn:hover svg {
          fill: #C9A96E !important;
          transform: scale(1.1);
        }
        .lemo-social-btn svg {
          transition: all 0.25s ease;
        }
        @keyframes popup { 
          from { opacity: 0; transform: scale(0.9) translateY(15px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

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
      </div>

      {/* شريط ذهبي */}
      <div style={{ background: "#C9A96E", color: "#fff", textAlign: "center", padding: "12px", fontSize: "0.95rem", fontWeight: "700" }}>
        🚚 شحن مجاني على الطلبات فوق {settings?.freeShippingMin || 2000} ج.م | 🎁 تغليف هدايا مجاني فاخر
      </div>

      {/* تصفح الأقسام */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#111", marginBottom: "3rem" }}>
          {lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {categories.length > 0 ? categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug || cat.id}`} style={{ textDecoration: "none", color: "inherit", textAlign: "center" }}>
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

      {/* قائمة التواصل العائمة التفاعلية بالأيقونات الرسمية الفاخرة */}
      <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        
        {isContactOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px", background: "#fff", padding: "16px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(61,43,31,0.15)", minWidth: "180px", transformOrigin: "bottom left", animation: "popup 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)" }}>
            
            {/* واتساب */}
            <a href={`https://wa.me/${settings?.whatsapp || "201009633100"}`} target="_blank" rel="noreferrer" className="lemo-social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.435.002 9.851-4.411 9.854-9.842.002-2.631-1.02-5.101-2.877-6.958C16.393 1.989 13.92 1.029 11.29 1.029c-5.441 0-9.857 4.415-9.86 9.85-.001 1.5.421 2.972 1.221 4.256l-.98 3.577 3.664-.962zm11.215-6.6c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.674.15-.2.3-.775.979-.95 1.179-.175.2-.35.225-.651.075-1.031-.516-1.741-1.027-2.434-2.217-.183-.314.183-.292.523-.97.076-.15.038-.282-.019-.395-.056-.113-.475-1.144-.651-1.569-.171-.413-.343-.357-.475-.364-.121-.006-.261-.007-.401-.007-.14 0-.368.052-.56.261-.192.209-.734.717-.734 1.748s.75 2.029.854 2.17c.104.14 1.477 2.254 3.578 3.162.5.216.89.345 1.194.442.502.16 0 .685-.1.831-.225.34-.734 1.056-.925 1.144-.191.088-.382.132-.683-.018z"/></svg>
              <span>واتساب</span>
            </a>

            {/* فيسبوك */}
            <a href={settings?.facebook || "https://facebook.com"} target="_blank" rel="noreferrer" className="lemo-social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>فيسبوك</span>
            </a>

            {/* إنستجرام */}
            <a href={settings?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" className="lemo-social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <span>إنستجرام</span>
            </a>

            {/* الإيميل */}
            <a href={`mailto:${settings?.email || "contact@lemostore.com"}`} className="lemo-social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#EA4335"><path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.38l-9 5.65-9-5.65V21H1.5C.65 21 0 20.35 0 19.5v-15c0-.85.65-1.5 1.5-1.5H3.4l8.6 5.4 8.6-5.4h1.9c.85 0 1.5.65 1.5 1.5z"/></svg>
              <span>الإيميل</span>
            </a>

          </div>
        )}

        {/* الزرار الرئيسي الدائري الأنيق */}
        <button 
          onClick={() => setIsContactOpen(!isContactOpen)} 
          style={{ background: "#111", color: "#fff", padding: "14px 26px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "1rem", boxShadow: "0 4px 25px rgba(0,0,0,0.25)", display: "flex", alignitems: "center", gap: "10px", transition: "all 0.3s" }}>
          {isContactOpen ? "✖ إغلاق" : "💬 تواصل معنا"}
        </button>
      </div>

    </div>
  );
}