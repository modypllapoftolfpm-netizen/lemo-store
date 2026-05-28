import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToBanners, getSettings, subscribeToCategories } from "../firebase/settings";

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

      {/* 1. شريط التصنيفات (Category Bar) */}
      <div style={{ background: "#fff", padding: "15px 2rem", borderBottom: "1px solid #f0e8df", display: "flex", justifyContent: "center", gap: "25px", flexWrap: "wrap", fontSize: "0.85rem", fontWeight: "700", color: "#3D2B1F" }}>
        {categories.map((cat, index) => (
          <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            <Link to={`/category/${cat.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{field(cat, "name")}</Link>
            {index < categories.length - 1 && <span style={{ color: "#E8DDD0" }}>✦</span>}
          </div>
        ))}
      </div>

      {/* 2. شريط الإعلانات (Ticker Bar) */}
      <div style={{ background: "#C9A96E", color: "#fff", padding: "10px 0", textAlign: "center", fontSize: "0.85rem", fontWeight: "600" }}>
        شحن مجاني على الطلبات فوق 2000 ج.م | تغليف هدايا فاخر
      </div>

      {/* 3. الهيرو سكشن (Hero Section) */}
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "4rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        {/* النص والزر */}
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

      {/* 4. الأقسام */}
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