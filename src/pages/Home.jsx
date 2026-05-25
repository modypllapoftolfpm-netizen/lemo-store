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

  // الفئات الافتراضية كحالة احتياطية لو الفايربيس لسه بيحمل
  const defaultCats = [
    { id: "gifts_default", slug: "gifts", nameAr: "هدايا فخمة", icon: "🎁", bg: "#FFF8F0" },
    { id: "scented_default", slug: "scented", nameAr: "شموع معطرة", icon: "🕯️", bg: "#F0F8FF" },
    { id: "decorative_default", slug: "decorative", nameAr: "شموع ديكورية", icon: "✨", bg: "#FFF0F8" },
    { id: "body_default", slug: "body", nameAr: "مرطبات الجسم", icon: "🧴", bg: "#F0FFF8" }
  ];

  useEffect(() => {
    const unsub1 = subscribeToProducts((data) => {
      setProducts(data);
    });
    
    const unsub2 = subscribeToBanners((data) => {
      setBanners(data);
    });

    const unsub3 = subscribeToCategories((data) => {
      // دمج الفئات القادمة من قاعدة البيانات لضمان قراءة الصور المرفوعة
      const merged = defaultCats.map(def => {
        const found = data.find(c => c.slug === def.slug || c.id === def.id);
        return found ? { ...def, ...found } : def;
      });
      setCategories(merged);
      setGlobalLoading(false);
    });

    getSettings().then((set) => {
      setSettings(set);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const c = { 
    p: settings.primaryColor || "#C9A96E", 
    d: settings.darkColor || "#3D2B1F", 
    bg: settings.bgColor || "#FAF7F2" 
  };
  
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

  if (globalLoading) {
    return (
      <div style={{ 
        position: "fixed", inset: 0, background: "#FAF7F2", 
        display: "flex", flexDirection: "column", alignItems: "center", 
        justifyContent: "center", zIndex: 99999, fontFamily: "Cairo, sans-serif" 
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pulse 1.8s infinite ease-in-out" }}>
          <img 
            src="https://lemo-store-eg.vercel.app/assets/logo.png" 
            alt="LEMO Store" 
            style={{ width: "240px", height: "auto", marginBottom: "15px", filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.04))" }}
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('fallback-loader').style.display = 'block';
            }}
          />
          <div id="fallback-loader" style={{ display: "none", fontSize: "4rem", marginBottom: "10px" }}>🕯️</div>
          <p style={{ color: "#C9A96E", fontSize: "0.85rem", fontWeight: "600", marginTop: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>Handmade Home Decor & Candles</p>
        </div>
        <style>{`@keyframes pulse { 0% { transform: scale(0.97); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(0.97); opacity: 0.8; } }`}</style>
      </div>
    );
  }

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, fontFamily: lang === "ar" ? "Cairo, sans-serif" : "DM Sans, sans-serif" }}>
      <Navbar />
      
      {mainBanner ? (
        <div style={{ position: "relative", height: "520px", overflow: "hidden" }}>
          <img src={mainBanner.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.15), ${c.d}E6)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "4rem", color: "#fff", textAlign: "center" }}>
            <h1 style={{ fontSize: "3.5rem", fontWeight: "800", margin: "0 0 1rem", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>{mainBanner.titleAr || "🕯️ LEMO Store"}</h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "2rem", maxWidth: "500px", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{mainBanner.subtitleAr || "شموع فاخرة وهدايا مميزة مصنوعة يدوياً"}</p>
            <Link to="/products" style={{ background: `linear-gradient(135deg, ${c.p}, ${c.p}DD)`, color: "#fff", padding: "14px 40px", borderRadius: "30px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem", boxShadow: `0 8px 25px ${c.p}66` }}>{t.home.shopNow} ✨</Link>
          </div>
        </div>
      ) : (
        <div style={{ height: "520px", background: `linear-gradient(135deg, ${c.d} 0%, ${c.p} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🕯️</div>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "800", margin: "0 0 1rem" }}>LEMO Store</h1>
          <p style={{ fontSize: "1.3rem", opacity: 0.85, marginBottom: "2rem" }}>شموع فاخرة وهدايا مميزة لكل مناسبة</p>
          <Link to="/products" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", padding: "14px 40px", borderRadius: "30px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem" }}>{t.home.shopNow} ✨</Link>
        </div>
      )}

      <div style={{ background: `linear-gradient(135deg, ${c.p}, ${c.p}DD)`, padding: "12px", textAlign: "center", color: "#fff", fontSize: "0.95rem", fontWeight: "600" }}>🚚 شحن مجاني على الطلبات فوق 500 ج.م | 🎁 تغليف هدايا مجاني</div>
      
      {/* ─── قسم عرض الفئات الذكي بالصور الحقيقية ─── */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <p style={{ color: c.p, fontWeight: "700", letterSpacing: "2px", fontSize: "0.85rem", marginBottom: "8px", textTransform: "uppercase" }}>تسوقي حسب</p>
        <h2 style={{ color: c.d, fontSize: "2.2rem", fontWeight: "800", marginBottom: "2.5rem", marginTop: 0 }}>{t.home.exploreCategories}</h2>
        <div style={{ display: "flex", gap: "1.5rem", shortcuts: "center", justifyContent: "center", flexWrap: "wrap", maxWidth: "1000px", margin: "0 auto" }}>
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ textDecoration: "none", flex: "1", minWidth: "160px", maxWidth: "220px" }}>
              <div style={{ 
                background: "#fff", 
                border: "1px solid #E8DDD0", 
                borderRadius: "24px", 
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                cursor: "pointer", 
                transition: "all 0.3s ease" 
              }} 
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${c.p}25`; }} 
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)"; }}>
                
                {/* عرض غلاف الفئة المرفوع كـ Base64 أو رابط، وإذا لم يوجد يعرض الـ Icon الافتراضي */}
                <div style={{ height: "140px", background: cat.bg || "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontSize: "3rem" }}>{cat.icon}</div>
                  )}
                </div>

                <div style={{ padding: "12px", background: "#fff", borderTop: "1px solid #FAF7F2" }}>
                  <div style={{ color: c.d, fontWeight: "700", fontSize: "1rem" }}>
                    {lang === "ar" ? cat.nameAr : cat.nameEn}
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>

      {bestSellers.length > 0 && (
        <div style={{ padding: "3rem 2rem", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: c.p, fontWeight: "700", letterSpacing: "2px", fontSize: "0.85rem", marginBottom: "8px" }}>⭐ BEST SELLERS</p>
            <h2 style={{ color: c.d, fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>{t.home.bestSellers}</h2>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", maxWidth: "1100px", margin: "0 auto" }}>
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} c={c} />)}
          </div>
        </div>
      )}

      {newArrivals.length > 0 && (
        <div style={{ padding: "3rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: c.p, fontWeight: "700", letterSpacing: "2px", fontSize: "0.85rem", marginBottom: "8px" }}>✨ NEW IN</p>
            <h2 style={{ color: c.d, fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>{t.home.newArrivals}</h2>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", maxWidth: "1100px", margin: "0 auto" }}>
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} c={c} />)}
          </div>
        </div>
      )}

      <div style={{ background: c.d, padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ color: c.p, fontSize: "2rem", fontWeight: "800", marginBottom: "2.5rem" }}>ليه LEMO Store؟</h2>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
          {[{ icon: "🕯️", title: "جودة فاخرة", desc: "منتجات مصنوعة بعناية من أجود الخامات" }, { icon: "🎁", title: "تغليف مميز", desc: "كل طلب يوصلك في تغليف هدايا أنيق" }, { icon: "🚚", title: "توصيل سريع", desc: "توصيل لكل أنحاء مصر" }, { icon: "💛", title: "ضمان الجودة", desc: "رضاكم أولويتنا دايماً" }].map((item) => (
            <div key={item.title} style={{ flex: "1", minWidth: "180px", maxWidth: "200px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{item.icon}</div>
              <h3 style={{ color: "#fff", fontWeight: "700", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ color: "#D4B896", fontSize: "0.9rem", margin: 0, lineHeight: "1.6" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: "#2C1810", color: "#E8DDD0", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px" }}>🕯️ LEMO Store</p>
        <p style={{ opacity: 0.6, fontSize: "0.9rem", margin: 0 }}>© 2026 جميع الحقوق محفوظة — صُنع بـ ❤️ في مصر</p>
      </footer>
    </div>
  );
}

function ProductCard({ product, field, t, addToCart, c }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };

  const hasDiscount = product.discount > 0;
  const finalPrice = hasDiscount ? product.price - (product.price * (product.discount / 100)) : product.price;
  
  const getDisplayImage = (imgField) => {
    if (Array.isArray(imgField)) return imgField[0] || "";
    return imgField || "";
  };

  return (
    <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", width: "230px", overflow: "hidden", transition: "transform 0.3s, box-shadow 0.3s", position: "relative" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = `0 15px 40px ${c.p}33`; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{ height: "220px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative", overflow: "hidden" }}>
          {getDisplayImage(product.imageUrl) ? <img src={getDisplayImage(product.imageUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🕯️"}
          
          {hasDiscount && (
            <span style={{ position: "absolute", top: "12px", right: "12px", background: "#E74C3C", color: "#fff", padding: "4px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", boxShadow: "0 2px 8px rgba(231,76,60,0.3)" }}>
              خصم {product.discount}%
            </span>
          )}

          {product.isNew && !hasDiscount && <span style={{ position: "absolute", top: "12px", right: "12px", background: `linear-gradient(135deg, ${c.p}, ${c.p}DD)`, color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>جديد</span>}
          {product.isBestSeller && <span style={{ position: "absolute", top: "12px", left: "12px", background: c.d, color: c.p, padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>⭐</span>}
        </div>
        <div style={{ padding: "1rem 1.2rem 0.5rem" }}>
          <h3 style={{ margin: "0 0 6px", color: c.d, fontSize: "1rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{field(product, "name")}</h3>
          
          {hasDiscount ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#E74C3C", fontWeight: "800", fontSize: "1.1rem" }}>{finalPrice} {t.currency}</span>
              <span style={{ color: "#8B7355", textDecoration: "line-through", fontSize: "0.85rem" }}>{product.price}</span>
            </div>
          ) : (
            <p style={{ color: c.p, fontWeight: "800", margin: 0, fontSize: "1.1rem" }}>{product.price} {t.currency}</p>
          )}
        </div>
      </Link>
      <div style={{ padding: "0.8rem 1.2rem 1.2rem" }}>
        <button onClick={handleAdd} style={{ width: "100%", background: added ? "#4CAF50" : `linear-gradient(135deg, ${c.p}, ${c.p}DD)`, color: "#fff", border: "none", borderRadius: "12px", padding: "10px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem", transition: "all 0.3s", boxShadow: `0 4px 15px ${c.p}4D` }}>
          {added ? "✓ تمت الإضافة" : t.products.addToCart}
        </button>
      </div>
    </div>
  );
}