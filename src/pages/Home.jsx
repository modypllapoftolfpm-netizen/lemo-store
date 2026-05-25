import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToBanners, getSettings, subscribeToCategories } from "../firebase/settings";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { t, field, lang } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true);
  
  // حالة التحكم في فتح وإغلاق قائمة التواصل العائمة
  const [showContactMenu, setShowContactMenu] = useState(false);

  const defaultCats = [
    { id: "gifts_default", slug: "gifts", nameAr: "هدايا فخمة", nameEn: "Luxury Gifts", icon: "🎁" },
    { id: "scented_default", slug: "scented", nameAr: "شموع معطرة", nameEn: "Scented Candles", icon: "🕯️" },
    { id: "decorative_default", slug: "decorative", nameAr: "شموع ديكورية", nameEn: "Decorative Candles", icon: "✨" },
    { id: "body_default", slug: "body", nameAr: "مرطبات الجسم", nameEn: "Body Essentials", icon: "🧴" }
  ];

  useEffect(() => {
    const unsub1 = subscribeToProducts((data) => { setProducts(data); });
    const unsub2 = subscribeToBanners((data) => { setBanners(data); });
    const unsub3 = subscribeToCategories((data) => {
      const merged = defaultCats.map(def => {
        const found = data.find(c => c.slug === def.slug || c.id === def.id);
        return found ? { ...def, ...found } : def;
      });
      setCategories(merged);
      setGlobalLoading(false);
    });
    getSettings().then((set) => { setSettings(set); });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const c = { 
    p: settings.primaryColor || "#C9A96E", 
    d: settings.darkColor || "#111111", 
    bg: settings.bgColor || "#FAF8F5" 
  };
  
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const featuredOffer = products.filter((p) => p.discount > 0).slice(0, 3);

  const fFamily = lang === "ar" ? "'Alexandria', sans-serif" : "'DM Sans', sans-serif";
  const fTitleFamily = lang === "ar" ? "'Alexandria', sans-serif" : "'Playfair Display', serif";

  const uiText = {
    heroDesc: lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك." : "Discover our premium products, made with top-quality ingredients that are gentle, aromatic, and irritation-free!",
    shopNow: lang === "ar" ? "تسوق الآن" : "Shop Now",
    shippingBar: lang === "ar" ? `🚚 شحن مجاني على الطلبات فوق ${settings.freeShippingLimit || 500} ج.م | 🎁 تغليف هدايا مجاني فاخر` : `🚚 Free Shipping on orders over ${settings.freeShippingLimit || 500} EGP | 🎁 Luxury Gift Wrapping Included`,
    catsTitle: lang === "ar" ? "تصفح الأقسام" : "Our Categories",
    popularTitle: lang === "ar" ? "المنتجات الأكثر مبيعاً" : "Most Popular Products",
    viewAll: lang === "ar" ? "عرض جميع المنتجات" : "View All Products",
    featuredTitle: lang === "ar" ? "عروض حصرية وتوفيرية لك" : "Featured Offer For You",
    featuredDesc: lang === "ar" ? "استفد من خصوماتنا الحصرية على باقات الشموع الديكورية الفاخرة ومنتجات العناية الطبيعية قبل نفاد الكمية." : "Take advantage of our exclusive discounts on premium candle bundles and organic skincare products before the quantity runs out.",
    shopSale: lang === "ar" ? "تسوق العروض الحالية" : "Shop Sale Items",
    footerDesc: lang === "ar" ? "شموع ديكورية فاخرة ومنتجات عناية طبيعية. منتجات مصنوعة يدوياً بكل حب لترتقي بجمال وأناقة منزلك." : "Luxury Candles & Wellness Essentials. Premium handmade products that elevate your home environment with pure scent and fine aesthetics.",
    helpTitle: lang === "ar" ? "مساعدة" : "Help",
    contactUs: lang === "ar" ? "اتصل بنا" : "Contact Us",
    aboutUs: lang === "ar" ? "من نحن" : "About Us",
    account: lang === "ar" ? "حسابي" : "Account",
    floatingBtn: lang === "ar" ? "💬 تواصل معنا" : "💬 Contact Us",
    rights: lang === "ar" ? `© 2026 Lemo Store — جميع الحقوق محفوظة — صُنع بحب في مصر` : `© 2026 Lemo Store — ALL RIGHTS RESERVED — MADE WITH ❤️ IN EGYPT`
  };

  if (globalLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#FAF8F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 99999, fontFamily: "'Alexandria', sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "3rem", fontWeight: "800", color: "#3D2B1F", marginBottom: "5px", fontFamily: "'Playfair Display', serif" }}>
            Lemo Store 🕯️
          </div>
          <p style={{ color: "#C9A96E", fontSize: "0.8rem", fontWeight: "600", letterSpacing: "2px" }}>HANDMADE HOME DECOR & CANDLES</p>
        </div>
      </div>
    );
  }

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.d, fontFamily: fFamily, overflowX: "hidden" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      {/* ─── 1) HERO SECTION ─── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px", textAlign: lang === "ar" ? "right" : "left" }}>
          <h1 style={{ fontSize: "3.6rem", fontWeight: "300", lineHeight: "1.2", color: c.d, margin: "0 0 1.5rem 0", fontFamily: fTitleFamily, letterSpacing: lang === "ar" ? "0" : "1px" }}>
            <span style={{ fontWeight: "800", color: "#3D2B1F", display: "block", marginBottom: "0.5rem" }}>Lemo Store</span> 
            {lang === "ar" ? "الشموع الفاخرة والديكور" : "Candles & Wellness"}
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: "1.8", marginBottom: "2.5rem", maxWidth: "480px", fontWeight: "300" }}>
            {uiText.heroDesc}
          </p>
          <Link to="/products" style={{ background: c.d, color: "#fff", padding: "14px 45px", borderRadius: "30px", textDecoration: "none", fontWeight: "600", fontSize: "0.95rem", display: "inline-block", transition: "all 0.3s", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
            {uiText.shopNow}
          </Link>
        </div>

        <div style={{ flex: "1 1 450px", display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "-10px", right: lang === "ar" ? "auto" : "40px", left: lang === "ar" ? "40px" : "auto", fontSize: "2.2rem", color: "#111", animation: "blink 2s infinite ease-in-out" }}>✦</div>
          <div style={{ position: "absolute", top: "40px", right: lang === "ar" ? "auto" : "15px", left: lang === "ar" ? "15px" : "auto", fontSize: "1.2rem", color: "#111", animation: "blink 3s infinite ease-in-out" }}>✦</div>
          <div style={{ position: "absolute", bottom: "80px", right: lang === "ar" ? "15px" : "auto", left: lang === "ar" ? "auto" : "15px", fontSize: "1.5rem", color: "#111", opacity: 0.6 }}>✦</div>
          
          <div style={{ width: "380px", height: "480px", border: "1px solid #111111", borderRadius: "200px 200px 0 0", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "185px 185px 0 0", overflow: "hidden" }}>
              <img 
                src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1887&auto=format&fit=cover"} 
                alt="Lemo Premium Arch" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
          </div>
          <div style={{ position: "absolute", bottom: "-25px", right: lang === "ar" ? "auto" : "-15px", left: lang === "ar" ? "-15px" : "auto", width: "110px", height: "110px", opacity: 0.2, background: "repeating-conic-gradient(from 0deg, #000 0deg 8deg, transparent 8deg 16deg)", borderRadius: "50%" }}></div>
        </div>
      </div>

      {/* ─── 2) MOVING MARQUEE ─── */}
      <div style={{ background: "#fff", borderTop: "1px solid #E8DDD0", borderBottom: "1px solid #E8DDD0", padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100vw", display: "flex" }}>
        <div style={{ display: "inline-block", animation: "marquee 25s infinite linear", fontSize: "1.1rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", color: "#3D2B1F", fontFamily: "'Playfair Display', serif" }}>
          ✦ PACKAGES ✦ OFFERS ✦ BUNDLES ✦ CANDLES ✦ HOME DECOR ✦ MERCHANDISE ✦ BODY ESSENTIALS ✦ SPECIAL GIFTS &nbsp;
        </div>
        <div style={{ display: "inline-block", animation: "marquee 25s infinite linear", fontSize: "1.1rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", color: "#3D2B1F", fontFamily: "'Playfair Display', serif" }}>
          ✦ PACKAGES ✦ OFFERS ✦ BUNDLES ✦ CANDLES ✦ HOME DECOR ✦ MERCHANDISE ✦ BODY ESSENTIALS ✦ SPECIAL GIFTS &nbsp;
        </div>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${c.p}, ${c.p}DD)`, padding: "12px", textAlign: "center", color: "#fff", fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.5px" }}>
        {uiText.shippingBar}
      </div>

      {/* ─── 3) OUR CATEGORIES ─── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "3.5rem", color: c.d, fontFamily: fTitleFamily }}>{uiText.catsTitle}</h2>
        <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ textDecoration: "none", color: "inherit", flex: "1 1 220px", maxWidth: "260px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                
                <div style={{ width: "100%", height: "340px", border: "1px solid #111111", borderRadius: "150px 150px 0 0", overflow: "hidden", position: "relative", marginBottom: "1rem", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#FAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>{cat.icon}</div>
                  )}
                </div>

                <span style={{ fontSize: "1.1rem", fontWeight: "600", color: c.d, marginTop: "0.5rem" }}>
                  {lang === "ar" ? cat.nameAr : cat.nameEn}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 4) MOST POPULAR PRODUCTS ─── */}
      {bestSellers.length > 0 && (
        <div style={{ background: "#fff", padding: "5rem 2rem", borderTop: "1px solid #E8DDD0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontSize: "2.4rem", fontWeight: "700", margin: 0, fontFamily: fTitleFamily }}>{uiText.popularTitle}</h2>
              <Link to="/products" style={{ color: c.d, fontWeight: "600", textDecoration: "underline", fontSize: "0.95rem" }}>{uiText.viewAll} ({products.length})</Link>
            </div>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} c={c} lang={lang} />)}
            </div>
          </div>
        </div>
      )}

      {/* ─── 5) FEATURED OFFER SECTION ─── */}
      {featuredOffer.length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem" }}>
          <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 350px", textAlign: lang === "ar" ? "right" : "left" }}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "1.5rem", fontFamily: fTitleFamily }}>{uiText.featuredTitle}</h2>
              <p style={{ color: "#666", lineHeight: "1.7", marginBottom: "2rem", fontWeight: "300" }}>{uiText.featuredDesc}</p>
              <Link to="/products" style={{ color: c.d, fontWeight: "600", textDecoration: "underline", fontSize: "0.95rem" }}>{uiText.shopSale}</Link>
            </div>
            <div style={{ flex: "2 1 600px", display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              {featuredOffer.map((p) => (
                <div key={p.id} style={{ flex: "1 1 200px", maxWidth: "240px", background: "#fff", border: "1px solid #E8DDD0", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "240px", position: "relative" }}>
                    <img src={Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: "10px", left: lang === "ar" ? "auto" : "10px", right: lang === "ar" ? "10px" : "auto", background: "#111", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" }}>
                      {lang === "ar" ? `خصم ${p.discount}%` : `${p.discount}% OFF`}
                    </span>
                  </div>
                  <div style={{ padding: "1rem", textAlign: lang === "ar" ? "right" : "left" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", fontWeight: "600" }}>{field(p, "name")}</h4>
                    <span style={{ fontWeight: "700", color: c.p }}>{p.price - (p.price * (p.discount/100))} {t.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 6) FOOTER (تم تصفية أزرار السوشيال ميديا منه ونقلها للزر العائم) ─── */}
      <footer style={{ background: "#FAF8F5", borderTop: "1px solid #E8DDD0", padding: "5rem 2rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", gap: "3rem", flexWrap: "wrap", borderBottom: "1px solid #E8DDD0", paddingBottom: "3rem" }}>
          
          <div style={{ flex: "2 1 350px", textAlign: lang === "ar" ? "right" : "left" }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 1rem 0", fontFamily: "'Playfair Display', serif" }}>Lemo Store</h3>
            <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "320px", lineHeight: "1.7", marginBottom: "1.5rem", fontWeight: "300" }}>{uiText.footerDesc}</p>
          </div>

          <div style={{ flex: "1 1 150px", textAlign: lang === "ar" ? "right" : "left" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: "0 0 1.2rem 0" }}>{uiText.helpTitle}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "#555", fontWeight: "300" }}>
              <span>{uiText.contactUs}</span><span>{uiText.aboutUs}</span><span>{uiText.account}</span>
            </div>
          </div>
          
          <div style={{ flex: "1 1 150px", textAlign: lang === "ar" ? "right" : "left" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: "0 0 1.2rem 0" }}>{lang === "ar" ? "الأقسام" : "Categories"}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "#555", fontWeight: "300" }}>
              <span>{lang === "ar" ? "شموع" : "Candles"}</span>
              <span>{lang === "ar" ? "مرطبات الجسم" : "Body Essentials"}</span>
              <span>{lang === "ar" ? "صناديق هدايا" : "Boxes"}</span>
              <span>{lang === "ar" ? "العروض" : "Offers"}</span>
            </div>
          </div>

        </div>
        <div style={{ textAlign: "center", paddingTop: "2rem", color: "#8B7355", fontSize: "0.85rem", opacity: 0.8, fontWeight: "300" }}>
          {uiText.rights}
        </div>
      </footer>

      {/* ─── 7) ونظام رادارات التواصل العائم المودرن (Floating Multi-Channel Widget) ─── */}
      <div style={{ position: "fixed", bottom: "30px", left: lang === "ar" ? "30px" : "auto", right: lang === "ar" ? "auto" : "30px", zIndex: 99999 }}>
        
        {/* قائمة الروابط المنبثقة لأعلى بسلاسة */}
        {showContactMenu && (
          <div style={{ 
            backgroundColor: "#fff", 
            border: "1px solid #E8DDD0", 
            borderRadius: "20px", 
            padding: "14px", 
            marginBottom: "15px", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)", 
            display: "flex", 
            flexDirection: "column", 
            gap: "10px",
            animation: "slideUp 0.3s ease-out"
          }}>
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111", fontSize: "0.9rem", fontWeight: "600", padding: "8px 16px", borderRadius: "12px", background: "#F4FFF7", border: "1px solid #C2F0C2" }}>
                <span style={{ fontSize: "1.2rem" }}>💚</span> WhatsApp
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111", fontSize: "0.9rem", fontWeight: "600", padding: "8px 16px", borderRadius: "12px", background: "#FFF0F5", border: "1px solid #FFCCD5" }}>
                <span style={{ fontSize: "1.2rem" }}>💖</span> Instagram
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111", fontSize: "0.9rem", fontWeight: "600", padding: "8px 16px", borderRadius: "12px", background: "#F0F5FF", border: "1px solid #CCDFFF" }}>
                <span style={{ fontSize: "1.2rem" }}>💙</span> Facebook
              </a>
            )}
          </div>
        )}

        {/* زر التشغيل العائم الرئيسي الثابت */}
        <button 
          onClick={() => setShowContactMenu(!showContactMenu)} 
          style={{ 
            background: c.d, 
            color: "#fff", 
            border: `1px solid ${c.p}`, 
            borderRadius: "30px", 
            padding: "12px 24px", 
            fontSize: "0.9rem", 
            fontWeight: "700", 
            cursor: "pointer", 
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {showContactMenu ? "✕" : uiText.floatingBtn}
        </button>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, field, t, addToCart, c, lang }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };

  const hasDiscount = product.discount > 0;
  const finalPrice = hasDiscount ? product.price - (product.price * (product.discount / 100)) : product.price;
  const imgUrl = Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl;

  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E8DDD0", width: "250px", overflow: "hidden", transition: "transform 0.3s ease", position: "relative", textAlign: lang === "ar" ? "right" : "left" }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ height: "260px", background: "#FAF8F5", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {imgUrl ? <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🕯️"}
          
          {hasDiscount && (
            <span style={{ position: "absolute", top: "12px", left: lang === "ar" ? "auto" : "12px", right: lang === "ar" ? "12px" : "auto", background: "#000", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "600" }}>
              -{product.discount}%
            </span>
          )}
          {product.isNew && <span style={{ position: "absolute", top: "12px", left: lang === "ar" ? "12px" : "auto", right: lang === "ar" ? "auto" : "12px", background: "#C9A96E", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "600" }}>{lang === "ar" ? "جديد" : "NEW"}</span>}
        </div>
        <div style={{ padding: "1.2rem 1.2rem 0.5rem 1.2rem" }}>
          <h3 style={{ margin: "0 0 8px 0", color: c.d, fontSize: "1.05rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{field(product, "name")}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: c.d, fontWeight: "700", fontSize: "1.1rem" }}>{finalPrice} {t.currency}</span>
            {hasDiscount && <span style={{ color: "#999", textDecoration: "line-through", fontSize: "0.85rem" }}>{product.price} {t.currency}</span>}
          </div>
        </div>
      </Link>
      <div style={{ padding: "0.5rem 1.2rem 1.2rem 1.2rem" }}>
        <button onClick={handleAdd} style={{ width: "100%", background: added ? "#4CAF50" : "#111", color: "#fff", border: "none", borderRadius: "20px", padding: "10px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", transition: "all 0.3s" }}>
          {added ? (lang === "ar" ? "✓ تمت الإضافة" : "✓ Added") : (lang === "ar" ? "إضافة للسلة" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}