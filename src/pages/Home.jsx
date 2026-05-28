import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useLang } from "../context/LangContext";
import { subscribeToBanners, getSettings, subscribeToCategories, subscribeToProducts } from "../firebase/settings";

const MovingCategoryTicker = ({ categories }) => (
  <div style={{ background: "#111", color: "#fff", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap", width: "100%", fontSize: "0.9rem", fontWeight: "600", borderBottom: "1px solid #333", margin: "2rem 0" }}>
    <div style={{ display: "inline-block", animation: "marquee 25s linear infinite", paddingLeft: "100%" }}>
      {categories.concat(categories).map((cat, index) => (
        <span key={index} style={{ margin: "0 25px", textTransform: "uppercase", letterSpacing: "1px" }}>{cat.nameEn || "CATEGORY"} ✦</span>
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
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const unsubBanners = subscribeToBanners((data) => setBanners(data));
    const unsubCats = subscribeToCategories((data) => setCategories(data));
    const unsubProds = subscribeToProducts((data) => setProducts(data));
    getSettings().then(() => setGlobalLoading(false));
    return () => { unsubBanners(); unsubCats(); unsubProds(); };
  }, [lang]);

  if (globalLoading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري التحميل...</div>;

  const mainBanner = banners[0];
  const bestSellers = products.filter(p => p.bestSeller === true);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      {/* 1. الهيرو سكشن (محدث بالتفاصيل) */}
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "4rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4rem", flexWrap: "wrap-reverse" }}>
        <div style={{ flex: "1 1 450px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#111", margin: "0 0 1rem 0" }}>Lemo Store</h1>
          <h2 style={{ fontSize: "2rem", color: "#3D2B1F", marginBottom: "1rem" }}>{lang === "ar" ? "الشموع الفاخرة والديكور" : "Luxury Candles & Decor"}</h2>
          <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.6", maxWidth: "400px" }}>
            {lang === "ar" ? "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية، الأنسب تماماً لمنزلك وعائلتك." : "Discover our premium handmade collection crafted from the finest fragrant materials, perfect for your home and family."}
          </p>
          <Link to="/products" style={{ background: "#111", color: "#fff", padding: "12px 40px", borderRadius: "8px", textDecoration: "none", fontWeight: "700" }}>{lang === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
        </div>
        
        {/* الحاوية الرئيسية للصورة مع العناصر الزخرفية */}
        <div style={{ position: "relative", width: "350px", height: "400px" }}>
          {/* النجمة الزخرفية */}
          <div style={{ position: "absolute", top: "-20px", left: "-20px", fontSize: "2rem", color: "#111" }}>✦</div>
          
          {/* الشكل الشعاعي */}
          <div style={{ position: "absolute", bottom: "-30px", left: "-40px", width: "100px", height: "100px", background: "radial-gradient(circle, #ddd 1px, transparent 1px)", backgroundSize: "10px 10px", zIndex: 0 }}></div>
          
          {/* إطار الصورة */}
          <div style={{ position: "relative", width: "100%", height: "100%", border: "1px solid #111", borderRadius: "180px 180px 0 0", padding: "10px", background: "#fff", zIndex: 1 }}>
            <img src={mainBanner?.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800"} style={{ width: "100%", height: "100%", borderRadius: "170px 170px 0 0", objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* 2. الشريط الأسود المتحرك */}
      <MovingCategoryTicker categories={categories} />

      {/* 3. الشريط الذهبي */}
      <div style={{ background: "#C9A96E", color: "#fff", padding: "15px 0", textAlign: "center", fontSize: "0.9rem", fontWeight: "700", marginBottom: "3rem" }}>
        {lang === "ar" ? "🚚 شحن مجاني على الطلبات فوق 2000 ج.م | 🎁 تغليف هدايا فاخر" : "🚚 Free shipping on orders over 2000 EGP | 🎁 Luxury Gift Wrap"}
      </div>

      {/* 4. تصفح الأقسام */}
      <div style={{ padding: "0 2rem 4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginBottom: "3rem" }}>{lang === "ar" ? "تصفح الأقسام" : "Browse Categories"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ width: "200px", height: "200px", borderRadius: "50%", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 5px 15px rgba(0,0,0,0.08)" }}>
                <img src={cat.imageUrl || cat.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ marginTop: "1rem", color: "#111" }}>{field(cat, "name")}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. الأكثر مبيعاً */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginBottom: "3rem" }}>{lang === "ar" ? "الأكثر مبيعاً" : "Best Sellers"}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {bestSellers.length > 0 ? bestSellers.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", width: "250px" }}>
              <img src={product.image} style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }} />
              <h3 style={{ marginTop: "1rem" }}>{field(product, "name")}</h3>
              <p style={{ color: "#C9A96E", fontWeight: "bold" }}>{product.price} ج.م</p>
            </Link>
          )) : <p>لا توجد منتجات مميزة حالياً</p>}
        </div>
      </div>

      {/* 6. زر تواصل معنا */}
      <a href="https://wa.me/201012345678" target="_blank" style={{ position: "fixed", bottom: "20px", left: "20px", background: "#111", color: "#fff", padding: "12px 25px", borderRadius: "50px", textDecoration: "none", fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", zIndex: "1000" }}>
        {lang === "ar" ? "تواصل معنا" : "Contact Us"}
      </a>
    </div>
  );
}