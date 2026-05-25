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

  if (globalLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#FAF8F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 99999, fontFamily: "Cairo, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pulse 1.8s infinite ease-in-out" }}>
          <img src="https://lemo-store-eg.vercel.app/assets/logo.png" alt="LEMO Store" style={{ width: "220px", height: "auto", marginBottom: "15px" }} />
          <p style={{ color: "#C9A96E", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "2px" }}>HANDMADE HOME DECOR & CANDLES</p>
        </div>
        <style>{`@keyframes pulse { 0% { transform: scale(0.97); opacity: 0.7; } 50% { transform: scale(1.01); opacity: 1; } 100% { transform: scale(0.97); opacity: 0.7; } }`}</style>
      </div>
    );
  }

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.d, fontFamily: "DM Sans, Cairo, sans-serif", overflowX: "hidden" }}>
      <Navbar />
      
      {/* ─── 1) HERO SECTION الفاخر بالأقواس الفنية ─── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem", display: "flex", alignItems: "center", justifyContent: "between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px", textAlign: lang === "ar" ? "right" : "left" }}>
          <h1 style={{ fontSize: "3.8rem", fontWeight: "300", lineHeight: "1.1", color: c.d, margin: "0 0 1.5rem 0", textTransform: "uppercase", letterSpacing: "1px" }}>
            Luxury <span style={{ fontWeight: "800", display: "block", color: "#2C1810" }}>Candles &</span> Wellness
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666", lineHeight: "1.7", marginBottom: "2.5rem", maxWidth: "480px" }}>
            Discover our premium products, made with top-quality ingredients that are gentle, aromatic, and irritation-free!
          </p>
          <Link to="/products" style={{ background: c.d, color: "#fff", padding: "14px 45px", borderRadius: "30px", textDecoration: "none", fontWeight: "600", fontSize: "1rem", display: "inline-block", transition: "all 0.3s", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
            shop now
          </Link>
        </div>

        <div style={{ flex: "1 1 450px", display: "flex", justifyContent: "center", position: "relative" }}>
          {/* نجوم الديكور الفنية الجانبية */}
          <div style={{ position: "absolute", top: "-20px", right: "20px", fontSize: "2rem", opacity: 0.8 }}>✦</div>
          <div style={{ position: "absolute", bottom: "40px", left: "0px", fontSize: "1.5rem", opacity: 0.5 }}>✦</div>
          
          <div style={{ width: "380px", height: "480px", border: `1px solid ${c.d}`, borderRadius: "200px 200px 0 0", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "190px 190px 0 0", overflow: "hidden" }}>
              <img 
                src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1887&auto=format&fit=cover"} 
                alt="LEMO Premium Arch" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
          </div>
          
          {/* عنصر الدائرة الشمسية المودرن في الأسفل */}
          <div style={{ position: "absolute", bottom: "-30px", right: "-20px", width: "120px", height: "120px", opacity: 0.15, background: "repeating-conic-gradient(from 0deg, #000 0deg 10deg, transparent 10deg 20deg)", borderRadius: "50%" }}></div>
        </div>
      </div>

      {/* ─── 2) MOVING MARQUEE الشريط المائل المتحرك ─── */}
      <div style={{ background: "#fff", borderTop: "1px solid #E8DDD0", borderBottom: "1px solid #E8DDD0", padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100vw", display: "flex" }}>
        <div style={{ display: "inline-block", animation: "marquee 20s infinite linear", fontSize: "1.1rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", color: "#3D2B1F" }}>
          ✦ PACKAGES ✦ OFFERS ✦ BUNDLES ✦ CANDLES ✦ HOME DECOR ✦ MERCHANDISE ✦ BODY ESSENTIALS ✦ SPECIAL GIFTS  
        </div>
        <div style={{ display: "inline-block", animation: "marquee 20s infinite linear", fontSize: "1.1rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", color: "#3D2B1F" }}>
          ✦ PACKAGES ✦ OFFERS ✦ BUNDLES ✦ CANDLES ✦ HOME DECOR ✦ MERCHANDISE ✦ BODY ESSENTIALS ✦ SPECIAL GIFTS  
        </div>
      </div>

      {/* ─── 3) OUR CATEGORIES قسم الفئات المقوسة الاحترافي ─── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "3.5rem", color: c.d }}>Our Categories</h2>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ textDecoration: "none", color: "inherit", flex: "1 1 220px", maxWidth: "260px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                
                {/* كادر القوس الفني المتناسق مع الهوية الجديدة بالملي */}
                <div style={{ width: "100%", height: "320px", border: "1px solid #111", borderRadius: "150px 150px 0 0", overflow: "hidden", position: "relative", marginBottom: "1rem", transition: "transform 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#FAF2EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>{cat.icon}</div>
                  )}
                </div>

                <span style={{ fontSize: "1.2rem", fontWeight: "700", letterSpacing: "0.5px", color: c.d, textTransform: "capitalize" }}>
                  {lang === "ar" ? cat.nameAr : cat.nameEn}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 4) MOST POPULAR PRODUCTS المنتجات الأكثر طلباً ─── */}
      {bestSellers.length > 0 && (
        <div style={{ background: "#fff", padding: "5rem 2rem", borderTop: "1px solid #E8DDD0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontSize: "2.4rem", fontWeight: "700", margin: 0 }}>Most Popular Products</h2>
              <Link to="/products" style={{ color: c.d, fontWeight: "700", textDecoration: "underline", fontSize: "1rem" }}>View All Products ({products.length})</Link>
            </div>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} field={field} t={t} addToCart={addToCart} c={c} />)}
            </div>
          </div>
        </div>
      )}

      {/* ─── 5) FEATURED OFFER SECTION قسم عروض التوفير ─── */}
      {featuredOffer.length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem" }}>
          <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 350px" }}>
              <h2 style={{ fontSize: "2.6rem", fontWeight: "700", marginBottom: "1.5rem" }}>Featured Offer For You</h2>
              <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "2rem" }}>Take advantage of our exclusive discounts on premium candle bundles and organic skincare products before the quantity runs out.</p>
              <Link to="/products" style={{ color: c.d, fontWeight: "700", textDecoration: "underline" }}>Shop Sale Items</Link>
            </div>
            <div style={{ flex: "2 1 600px", display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              {featuredOffer.map((p) => (
                <div key={p.id} style={{ flex: "1 1 200px", maxWidth: "240px", background: "#fff", border: "1px solid #E8DDD0", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "240px", position: "relative" }}>
                    <img src={Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: "10px", left: "10px", background: "#000", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>{p.discount}% OFF</span>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem" }}>{field(p, "name")}</h4>
                    <span style={{ fontWeight: "700", color: c.p }}>{p.price - (p.price * (p.discount/100))} ج.م</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 6) FOOTER الفخم المتكامل بالهوية المودرن ─── */}
      <footer style={{ background: "#FAF8F5", borderTop: "1px solid #E8DDD0", padding: "5rem 2rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "between", gap: "3rem", flexWrap: "wrap", pb: "3rem", borderBottom: "1px solid #E8DDD0", paddingBottom: "3rem" }}>
          <div style={{ flex: "2 1 350px" }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 1rem 0", letterSpacing: "1px" }}>LEMO Store</h3>
            <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "320px", lineHeight: "1.6" }}>Luxury Candles & Wellness Essentials. Premium handmade products that elevate your home environment with pure scent and fine aesthetics.</p>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: "0 0 1.2rem 0" }}>Help</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "#555" }}>
              <span>Contact Us</span><span>About Us</span><span>Account</span>
            </div>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: "0 0 1.2rem 0" }}>Categories</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "#555" }}>
              <span>Candles</span><span>Body Essentials</span><span>Boxes</span><span>Offers</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", paddingTop: "2rem", color: "#8B7355", fontSize: "0.85rem", opacity: 0.8 }}>
          © 2026 LEMO Store — ALL RIGHTS RESERVED — MADE WITH ❤️ IN EGYPT
        </div>
      </footer>

      {/* كود الأنيميشن المخصص لحركة الـ Marquee بنعومة فائقة */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, field, t, addToCart, c }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };

  const hasDiscount = product.discount > 0;
  const finalPrice = hasDiscount ? product.price - (product.price * (product.discount / 100)) : product.price;
  const imgUrl = Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl;

  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E8DDD0", width: "250px", overflow: "hidden", transition: "transform 0.3s ease", position: "relative" }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ height: "260px", background: "#FAF8F5", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {imgUrl ? <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🕯️"}
          
          {hasDiscount && (
            <span style={{ position: "absolute", top: "12px", left: "12px", background: "#000", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700" }}>
              -{product.discount}%
            </span>
          )}
          {product.isNew && <span style={{ position: "absolute", top: "12px", right: "12px", background: "#C9A96E", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700" }}>NEW</span>}
        </div>
        <div style={{ padding: "1.2rem 1.2rem 0.5rem 1.2rem" }}>
          <h3 style={{ margin: "0 0 8px 0", color: c.d, fontSize: "1.05rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{field(product, "name")}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: c.d,确: true, fontWeight: "800", fontSize: "1.1rem" }}>{finalPrice} ج.م</span>
            {hasDiscount && <span style={{ color: "#999", textDecoration: "line-through", fontSize: "0.85rem" }}>{product.price} ج.م</span>}
          </div>
        </div>
      </Link>
      <div style={{ padding: "0.5rem 1.2rem 1.2rem 1.2rem" }}>
        <button onClick={handleAdd} style={{ width: "100%", background: added ? "#4CAF50" : "#111", color: "#fff", border: "none", borderRadius: "20px", padding: "10px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", transition: "all 0.3s" }}>
          {added ? "✓ Added To Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}