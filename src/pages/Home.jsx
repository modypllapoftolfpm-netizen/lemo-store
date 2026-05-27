import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToBanners, getSettings, subscribeToCategories } from "../firebase/settings";
import { useCart } from "../context/CartContext";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Home() {
  const { t, field, lang } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  const defaultCats = [
    { id: "gifts_default", slug: "gifts", nameAr: "هدايا فخمة", nameEn: "Luxury Gifts", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=cover" },
    { id: "scented_default", slug: "scented", nameAr: "شموع معطرة", nameEn: "Scented Candles", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=cover" },
    { id: "decorative_default", slug: "decorative", nameAr: "شموع ديكورية", nameEn: "Decorative Candles", image: "https://images.unsplash.com/photo-1572454591674-2739f30d8c40?q=80&w=800&auto=format&fit=cover" },
    { id: "body_default", slug: "body", nameAr: "مرطبات الجسم", nameEn: "Body Essentials", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=cover" }
  ];

  useEffect(() => {
    const unsub1 = subscribeToProducts((data) => { setProducts(data); });
    const unsub2 = subscribeToBanners((data) => { setBanners(data); });
    const unsub3 = subscribeToCategories((data) => {
      const merged = defaultCats.map(def => {
        const found = data.find(c => c.slug === def.slug || c.id === def.id);
        return found ? { ...def, ...found } : def;
      });
      setCategories(merged.reverse());
    });
    
    getSettings().then((set) => { setSettings(set); });

    async function fetchRealTestimonials() {
      try {
        const qReviews = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(6));
        const querySnap = await getDocs(qReviews);
        let reviewsList = [];
        querySnap.forEach((doc) => {
          const rData = doc.data();
          if (rData.comment || rData.review) {
            reviewsList.push({
              name: rData.customerName || "عميل حقيقي",
              review: rData.comment || rData.review || "",
              stars: Number(rData.rating) || 5,
            });
          }
        });
        setTestimonials(reviewsList);
      } catch (e) { console.log("No reviews available yet."); }
      setGlobalLoading(false);
    }

    fetchRealTestimonials();
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [lang]);

  const c = { p: settings.primaryColor || "#C9A96E", d: settings.darkColor || "#111111", bg: settings.bgColor || "#FAF8F5" };
  const fFamily = lang === "ar" ? "'Cairo', sans-serif" : "'DM Sans', sans-serif";
  const fTitleFamily = lang === "ar" ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  const uiText = {
    heroDesc: lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك." : "Discover our premium handmade collection.",
    shopNow: lang === "ar" ? "تسوق الآن" : "Shop Now",
    shippingBar: lang === "ar" ? `🚚 شحن مجاني على الطلبات فوق ${settings.freeShippingLimit || 2000} ج.م | 🎁 تغليف هدايا مجاني فاخر` : `🚚 Free Shipping over ${settings.freeShippingLimit || 2000} EGP | 🎁 Free Luxury Gift Wrapping`,
    reviewsTitle: lang === "ar" ? "ماذا يقول عملائنا؟" : "What Our Customers Say",
  };

  if (globalLoading) return <div style={{ position: "fixed", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري التحميل...</div>;

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: c.d, fontFamily: fFamily, overflowX: "hidden" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      {/* 1. قسم الهيرو */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px", textAlign: lang === "ar" ? "right" : "left" }}>
          <h1 style={{ fontSize: "3.2rem", fontWeight: "300", color: c.d, margin: "0 0 1rem 0", fontFamily: fTitleFamily }}>
            <span style={{ fontWeight: "900", color: "#3D2B1F", display: "block", marginBottom: "5px" }}>Lemo Store</span> 
            {lang === "ar" ? "الشموع الفاخرة والديكور" : "Luxury Candles & Decor"}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666", lineHeight: "1.8", marginBottom: "2.5rem", maxWidth: "450px" }}>{uiText.heroDesc}</p>
          <Link to="/products" style={{ background: c.d, color: "#fff", padding: "12px 40px", borderRadius: "30px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem" }}>{uiText.shopNow}</Link>
        </div>
        <div style={{ width: "350px", height: "450px", border: "1px solid #111", borderRadius: "200px 200px 0 0", padding: "12px" }}>
            <img src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1887&auto=format&fit=cover"} style={{ width: "100%", height: "100%", borderRadius: "185px 185px 0 0", objectFit: "cover" }} />
        </div>
      </div>

      {/* 2. شريط الكلمات المتحرك (Marquee) */}
      <div style={{ width: "100%", overflow: "hidden", background: "#fff", padding: "15px 0", borderTop: "1px solid #E8DDD0", borderBottom: "1px solid #E8DDD0" }}>
        <marquee scrollamount="6" style={{ fontWeight: "800", color: "#3D2B1F", letterSpacing: "3px", fontSize: "1.1rem", fontFamily: "'Arial', sans-serif" }}>
          BODY ESSENTIALS ✦ SPECIAL GIFTS ✦ PACKAGES ✦ OFFERS ✦ BUNDLES ✦ CANDLES ✦ HOME DECOR ✦ MERCHANDISE ✦ BODY ESSENTIALS ✦ SPECIAL GIFTS ✦ PACKAGES ✦ OFFERS ✦ BUNDLES
        </marquee>
      </div>

      {/* 3. شريط الشحن */}
      <div style={{ background: `linear-gradient(135deg, ${c.p}, #b8925a)`, padding: "12px", textAlign: "center", color: "#fff", fontWeight: "700", fontSize: "1rem" }}>{uiText.shippingBar}</div>

      {/* 4. قسم تصفح الأقسام (Arch Design) */}
      <div style={{ background: "#fff", padding: "5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#111", marginBottom: "4rem", fontFamily: fTitleFamily }}>
            {lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}
          </h2>

          <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
            {categories.slice(0, 4).map((cat, idx) => (
              <Link key={cat.id || idx} to={`/category/${cat.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div 
                  style={{
                    width: "230px", height: "310px",
                    border: "1px solid #3D2B1F",
                    borderRadius: "150px 150px 0 0",
                    overflow: "hidden", // بيخلي الصورة تملأ القوس بالكامل
                    transition: "transform 0.3s ease",
                    cursor: "pointer",
                    background: "#fff",
                    marginBottom: "1.5rem"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-10px)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none" }}
                >
                  <img src={cat.imageUrl || cat.image} alt={field(cat, "name")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111", margin: 0 }}>{field(cat, "name")}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. قسم المنتجات الأكثر مبيعاً */}
      <div style={{ background: "#fff", padding: "2rem 2rem 5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.6rem", fontWeight: "900", color: "#111", marginBottom: "1rem", fontFamily: fTitleFamily }}>
            {lang === "ar" ? "المنتجات الأكثر مبيعاً" : "Best Sellers"}
          </h2>
          <Link to="/products" style={{ color: "#666", textDecoration: "none", display: "inline-block", marginBottom: "3rem", fontSize: "1rem", fontWeight: "bold" }}>
            {lang === "ar" ? "عرض جميع المنتجات ←" : "View all products →"}
          </Link>

          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {products.slice(0, 4).map((p) => (
              <div key={p.id} style={{ width: "260px", background: "#fff", border: "1px solid #E8DDD0", borderRadius: "15px", padding: "15px", textAlign: lang === "ar" ? "right" : "left", position: "relative", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <div style={{ position: "absolute", top: "25px", left: lang === "ar" ? "25px" : "auto", right: lang === "ar" ? "auto" : "25px", background: "#111", color: "#fff", padding: "4px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold", zIndex: 2 }}>جديد</div>
                <div style={{ height: "260px", borderRadius: "10px", overflow: "hidden", marginBottom: "1rem" }}>
                  <img src={p.imageUrl} alt={field(p, "name")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#111", margin: "0 0 8px 0" }}>{field(p, "name")}</h3>
                <div style={{ color: "#C9A96E", fontWeight: "900", fontSize: "1.2rem", marginBottom: "1rem" }}>{p.price} {t.currency}</div>
                <button onClick={() => addToCart(p, 1)} style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>
                  {lang === "ar" ? "إضافة للسلة" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. قسم التقييمات */}
      {testimonials.length > 0 && (
        <div style={{ background: "#FAF8F5", padding: "6rem 2rem", borderTop: "1px solid #E8DDD0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#666", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
              {lang === "ar" ? "آراء وتقييمات حقيقية" : "REAL REVIEWS"}
            </span>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "4rem", color: c.d, fontFamily: fTitleFamily }}>{uiText.reviewsTitle}</h2>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              {testimonials.map((t, idx) => (
                <div key={idx} style={{ flex: "1 1 300px", maxWidth: "360px", background: "#fff", border: "1px solid #E8DDD0", borderRadius: "20px", padding: "2rem", textAlign: lang === "ar" ? "right" : "left", display: "flex", flexDirection: "column", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                  <div style={{ color: "#C9A96E", fontSize: "1.4rem", marginBottom: "1rem" }}>{"★".repeat(t.stars)}</div>
                  <p style={{ fontSize: "1.05rem", lineHeight: "1.8", margin: "0 0 1.5rem 0", color: "#444", fontWeight: "500" }}>"{t.review}"</p>
                  <div style={{ marginTop: "auto", borderTop: "1px solid #FAF8F5", paddingTop: "1rem" }}>
                    <span style={{ fontWeight: "900", color: "#111", fontSize: "1.1rem" }}>{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}