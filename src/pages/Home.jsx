import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToBanners, getSettings, subscribeToCategories, subscribeToProducts } from "../firebase/settings";

const MovingCategoryTicker = ({ categories }) => (
  <div style={{ background: "#111", color: "#fff", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100%", fontSize: "0.9rem", fontWeight: "600", borderBottom: "1px solid #333", margin: "2rem 0" }}>
    <div style={{ display: "inline-block", animation: "marquee 25s linear infinite", paddingLeft: "100%" }}>
      {categories.concat(categories).map((cat, index) => (
        <span key={index} style={{ margin: "0 25px", textTransform: "uppercase", letterSpacing: "1px" }}>
          {cat.nameEn || "CATEGORY"} ✦
        </span>
      ))}
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
  </div>
);

export default function Home() {
  const { field, lang } = useLang();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const unsubBanners = subscribeToBanners((data) => setBanners(data));
    const unsubCats = subscribeToCategories((data) => setCategories(data));
    const unsubProds = subscribeToProducts((data) => setProducts(data));
    
    getSettings().then((data) => {
      setSettings(data);
      setGlobalLoading(false);
    });
    return () => { unsubBanners(); unsubCats(); unsubProds(); };
  }, [lang]);

  if (globalLoading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري التحميل...</div>;

  const heroBanner = banners.find(b => b.sectionKey === 'hero') || {};
  const bestSellers = products.filter(p => p.isBestSeller === true);
  const newProducts = products.filter(p => p.isNew === true);

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", width: "250px", margin: "1rem" }}>
      <img 
        src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} 
        style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }} 
      />
      <h3 style={{ marginTop: "1rem" }}>{field(product, "name")}</h3>
      <p style={{ color: "#C9A96E", fontWeight: "bold" }}>{product.price} ج.م</p>
      {settings?.showStock !== false && <p style={{ fontSize: "0.8rem", color: "#888" }}>المتبقي: {product.stock}</p>}
    </Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      {/* البانر الرئيسي الديناميكي */}
      <div style={{ padding: "6rem 2rem", textAlign: "center", background: heroBanner.imageUrl ? `url(${heroBanner.imageUrl}) center/cover` : "#fff", color: "#3D2B1F" }}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: "900", margin: 0 }}>
          {lang === "ar" ? (heroBanner.titleAr || "ليمو ستور") : (heroBanner.titleEn || "Lemo Store")}
        </h1>
      </div>

      <MovingCategoryTicker categories={categories} />

      {/* 1. الأكثر مبيعاً */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginBottom: "3rem" }}>{lang === "ar" ? "الأكثر مبيعاً" : "Best Sellers"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {bestSellers.length > 0 ? bestSellers.map(p => <ProductCard key={p.id} product={p} />) : <p>لا توجد منتجات مميزة</p>}
        </div>
      </div>

      {/* 2. المنتجات الجديدة */}
      <div style={{ padding: "4rem 2rem", textAlign: "center", background: "#F0E8DF" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginBottom: "3rem" }}>{lang === "ar" ? "وصلنا حديثاً" : "New Arrivals"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {newProducts.length > 0 ? newProducts.map(p => <ProductCard key={p.id} product={p} />) : <p>لا توجد منتجات جديدة</p>}
        </div>
      </div>
    </div>
  );
}