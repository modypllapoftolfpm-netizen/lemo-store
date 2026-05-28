import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToBanners, getSettings, subscribeToCategories } from "../firebase/settings";

// المكون المتحرك الأسود (الفئات بالإنجليزي)
const MovingCategoryTicker = ({ categories }) => {
  return (
    <div style={{
      background: "#111",
      color: "#fff",
      padding: "12px 0",
      overflow: "hidden",
      whiteSpace: "nowrap",
      width: "100%",
      fontSize: "0.9rem",
      fontWeight: "600",
      borderBottom: "1px solid #333"
    }}>
      <div style={{
        display: "inline-block",
        animation: "marquee 25s linear infinite",
        paddingLeft: "100%"
      }}>
        {categories.concat(categories).map((cat, index) => (
          <span key={index} style={{ margin: "0 25px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {cat.nameEn || "CATEGORY"} ✦
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  const { field, lang } = useLang();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const unsub2 = subscribeToBanners((data) => setBanners(data));
    const unsub3 = subscribeToCategories((data) => setCategories(data));
    getSettings().then(() => setGlobalLoading(false));
    return () => { unsub2(); unsub3(); };
  }, [lang]);

  if (globalLoading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري التحميل...</div>;

  const mainBanner = banners[0];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      {/* 1. الشريط الأسود المتحرك (الجديد) */}
      <MovingCategoryTicker categories={categories} />

      {/* 2. الهيرو سكشن (Hero Section) */}
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "4rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#111", margin: "0 0 1rem 0" }}>Lemo Store</h1>
          <h2 style={{ fontSize: "2rem", color: "#3D2B1F", marginBottom: "1.5rem" }}>{lang === "ar" ? "الشموع الفاخرة والديكور" : "Luxury Candles & Decor"}</h2>
          <p style={{ color: "#666", marginBottom: "2.5rem" }}>{lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية" : "Discover our premium handmade collection."}</p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "12px 40px", borderRadius: "8px", textDecoration: "none", fontWeight: "700" }}>{lang === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
        </div>

        {/* الصورة (القبة) */}
        <div style={{ width: "350px", height: "400px", border: "1px solid #111", borderRadius: "180px 180px 0 0", padding: "10px", background: "#fff" }}>
          <img src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800"} style={{ width: "100%", height: "100%", borderRadius: "170px 170px 0 0", objectFit: "cover" }} />
        </div>
      </div>

      {/* 3. الأقسام */}
      <div style={{ background: "#fff", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginBottom: "3rem" }}>{lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ width: "200px", height: "200px", borderRadius: "50%", overflow: "hidden", border: "4px solid #FAF8F5", boxShadow: "0 5px 15px rgba(0,0,0,0.08)" }}>
                <img src={cat.imageUrl || cat.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ marginTop: "1rem", color: "#111" }}>{field(cat, "name")}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}