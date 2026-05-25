import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToBanners, getSettings, subscribeToCategories } from "../firebase/settings";
import { useCart } from "../context/CartContext";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function Home() {
  const { t, field, lang } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
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
              imageUrl: rData.imageUrl || null,
              date: rData.createdAt ? (lang === "ar" ? "تم التقييم مؤخراً" : "Recently") : ""
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
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const featuredOffer = products.filter((p) => p.discount > 0).slice(0, 3);
  const fFamily = lang === "ar" ? "'Alexandria', sans-serif" : "'DM Sans', sans-serif";
  const fTitleFamily = lang === "ar" ? "'Alexandria', sans-serif" : "'Playfair Display', serif";

  const uiText = {
    heroDesc: lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً." : "Discover our premium products.",
    shopNow: lang === "ar" ? "تسوق الآن" : "Shop Now",
    shippingBar: lang === "ar" ? `🚚 شحن مجاني فوق ${settings.freeShippingLimit || 500} ج.م` : `🚚 Free Shipping over ${settings.freeShippingLimit || 500} EGP`,
    catsTitle: lang === "ar" ? "تصفح الأقسام" : "Our Categories",
    popularTitle: lang === "ar" ? "المنتجات الأكثر مبيعاً" : "Most Popular Products",
    viewAll: lang === "ar" ? "عرض جميع المنتجات" : "View All Products",
    featuredTitle: lang === "ar" ? "عروض حصرية" : "Featured Offer",
    featuredDesc: lang === "ar" ? "استفد من خصوماتنا الحصرية." : "Take advantage of our exclusive discounts.",
    shopSale: lang === "ar" ? "تسوق العروض" : "Shop Sale",
    reviewsTitle: lang === "ar" ? "آراء عملائنا" : "What Our Customers Say",
    reviewsSub: lang === "ar" ? "تجارب حقيقية" : "Real Experiences",
    footerDesc: lang === "ar" ? "شموع فاخرة ومنتجات عناية." : "Luxury Candles & Wellness.",
    helpTitle: lang === "ar" ? "مساعدة" : "Help",
    contactUs: lang === "ar" ? "اتصل بنا" : "Contact Us",
    aboutUs: lang === "ar" ? "من نحن" : "About Us",
    account: lang === "ar" ? "حسابي" : "Account",
    floatingBtn: lang === "ar" ? "💬 تواصل معنا" : "💬 Contact Us",
    rights: lang === "ar" ? "© 2026 Lemo Store — جميع الحقوق محفوظة" : "© 2026 Lemo Store — ALL RIGHTS RESERVED"
  };

  if (globalLoading) return <div style={{ position: "fixed", inset: 0, background: "#FAF8F5", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.d, fontFamily: fFamily, overflowX: "hidden" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px", textAlign: lang === "ar" ? "right" : "left" }}>
          <h1 style={{ fontSize: "3.6rem", fontWeight: "300", color: c.d, margin: "0 0 1.5rem 0", fontFamily: fTitleFamily }}><span style={{ fontWeight: "800", color: "#3D2B1F", display: "block" }}>Lemo Store</span> {lang === "ar" ? "الشموع الفاخرة" : "Candles & Wellness"}</h1>
          <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: "1.8", marginBottom: "2.5rem" }}>{uiText.heroDesc}</p>
          <Link to="/products" style={{ background: c.d, color: "#fff", padding: "14px 45px", borderRadius: "30px", textDecoration: "none", fontWeight: "600" }}>{uiText.shopNow}</Link>
        </div>
        <div style={{ width: "380px", height: "480px", border: "1px solid #111", borderRadius: "200px 200px 0 0", padding: "14px" }}>
            <img src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1887&auto=format&fit=cover"} style={{ width: "100%", height: "100%", borderRadius: "185px 185px 0 0", objectFit: "cover" }} />
        </div>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${c.p}, ${c.p}DD)`, padding: "12px", textAlign: "center", color: "#fff", fontWeight: "600" }}>{uiText.shippingBar}</div>

      {testimonials.length > 0 && (
        <div style={{ background: "#fff", padding: "5rem 2rem", borderTop: "1px solid #E8DDD0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "3.5rem", color: c.d, fontFamily: fTitleFamily }}>{uiText.reviewsTitle}</h2>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              {testimonials.map((t, idx) => (
                <div key={idx} style={{ flex: "1 1 300px", maxWidth: "360px", background: "#FAF8F5", border: "1px solid #E8DDD0", borderRadius: "20px", padding: "1.5rem", textAlign: lang === "ar" ? "right" : "left", display: "flex", flexDirection: "column", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  {t.imageUrl && (
                    <div style={{ marginBottom: "1.5rem", borderRadius: "15px", overflow: "hidden", height: "200px" }}>
                      <img src={t.imageUrl} alt="Review" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div>
                    <div style={{ color: "#C9A96E", fontSize: "1.1rem" }}>{"★".repeat(t.stars)}</div>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.7", margin: "1rem 0" }}>"{t.review}"</p>
                  </div>
                  <div style={{ marginTop: "auto", borderTop: "1px solid #E8DDD0", paddingTop: "1rem" }}>
                    <span style={{ fontWeight: "700" }}>{t.name}</span>
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

function ProductCard({ product, field, t, addToCart, c, lang }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };
  const imgUrl = Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl;
  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E8DDD0", width: "250px", padding: "1rem" }}>
      <img src={imgUrl} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }} />
      <h3>{field(product, "name")}</h3>
      <button onClick={handleAdd}>{added ? "✓" : "Add to Cart"}</button>
    </div>
  );
}