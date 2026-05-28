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
    
    getSettings().then((set) => { setSettings(set); setGlobalLoading(false); });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [lang]);

  const c = { p: settings.primaryColor || "#C9A96E", d: settings.darkColor || "#111111", bg: settings.bgColor || "#FAF8F5" };
  const fFamily = lang === "ar" ? "'Cairo', sans-serif" : "'DM Sans', sans-serif";
  const fTitleFamily = lang === "ar" ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  if (globalLoading) return <div style={{ position: "fixed", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري التحميل...</div>;

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: c.d, fontFamily: fFamily, overflowX: "hidden" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px", textAlign: lang === "ar" ? "right" : "left" }}>
          <h1 style={{ fontSize: "3.2rem", fontWeight: "300", color: c.d, margin: "0 0 1rem 0", fontFamily: fTitleFamily }}>
            <span style={{ fontWeight: "900", color: "#3D2B1F", display: "block", marginBottom: "5px" }}>Lemo Store</span> 
            {lang === "ar" ? "الشموع الفاخرة والديكور" : "Luxury Candles & Decor"}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666", lineHeight: "1.8", marginBottom: "2.5rem", maxWidth: "450px" }}>{lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً." : "Discover our premium handmade collection."}</p>
          <Link to="/products" style={{ background: c.d, color: "#fff", padding: "12px 40px", borderRadius: "30px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem" }}>{lang === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
        </div>
        <div style={{ width: "350px", height: "450px", border: "1px solid #111", borderRadius: "200px 200px 0 0", padding: "12px" }}>
            <img src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1887&auto=format&fit=cover"} style={{ width: "100%", height: "100%", borderRadius: "185px 185px 0 0", objectFit: "cover" }} />
        </div>
      </div>

      <div style={{ background: "#fff", padding: "5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#111", marginBottom: "4rem", fontFamily: fTitleFamily }}>
            {lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
            {categories.slice(0, 4).map((cat, idx) => (
              <Link key={cat.id || idx} to={`/category/${cat.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "230px", height: "310px", border: "1px solid #3D2B1F", borderRadius: "150px 150px 0 0", overflow: "hidden", background: "#fff", marginBottom: "1.5rem" }}>
                  <img src={cat.imageUrl || cat.image} alt={field(cat, "name")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111", margin: 0 }}>{field(cat, "name")}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}