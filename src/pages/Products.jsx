import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToCategories } from "../firebase/settings"; // 🔴 استدعاء الأقسام من الداتا بيز

export default function Products() {
  const { t, field, lang } = useLang();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // 🔴 حالة حفظ الأقسام
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";

  useEffect(() => {
    // جلب المنتجات
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    
    // 🔴 جلب الأقسام
    const unsubCategories = subscribeToCategories((data) => {
      setCategories(data);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = field(p, "name").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getDisplayImage = (imgField) => {
    if (Array.isArray(imgField)) return imgField[0] || "";
    return imgField || "";
  };

  if (loading) {
    return (
      <div style={{ 
        position: "fixed", inset: 0, background: "#FAF7F2", 
        display: "flex", flexDirection: "column", alignItems: "center", 
        justifyContent: "center", zIndex: 99999 
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pulse 1.8s infinite ease-in-out" }}>
          <img src="https://lemo-store-eg.vercel.app/assets/logo.png" alt="LEMO LUXE" style={{ width: "240px", height: "auto", marginBottom: "15px" }} />
          <p style={{ color: "#C9A96E", fontSize: "0.85rem", fontWeight: "600", fontFamily: "Cairo, sans-serif", letterSpacing: "1px" }}>Handmade Home Decor & Candles</p>
        </div>
        <style>{`@keyframes pulse { 0% { transform: scale(0.97); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(0.97); opacity: 0.8; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", paddingBottom: "4rem" }} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <style>{`
        .lemo-product-card {
          background: #fff;
          border-radius: 20px;
          width: 240px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 15px rgba(61, 43, 31, 0.03);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease;
        }
        .lemo-product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(61, 43, 31, 0.08);
        }
        .lemo-img-container {
          height: 250px;
          overflow: hidden;
          position: relative;
          background: #FAF8F5;
        }
        .lemo-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .lemo-product-card:hover .lemo-product-img {
          transform: scale(1.06);
        }
        .lemo-action-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 1.5rem 1rem 1rem 1rem;
          background: linear-gradient(to top, rgba(255,255,255,0.95) 70%, transparent);
          display: flex;
          gap: 8px;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .lemo-product-card:hover .lemo-action-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        .category-filter-btn {
          padding: 8px 22px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          font-family: 'Cairo', sans-serif;
          transition: all 0.3s ease;
        }
        @media (max-width: 768px) {
          .lemo-product-card { width: 46%; flex-grow: 1; }
          .lemo-img-container { height: 190px; }
          .lemo-action-overlay { opacity: 1; transform: translateY(0); background: transparent; padding: 0.5rem; position: static; }
        }
      `}</style>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem", fontWeight: "900", fontSize: "2.2rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🕯️</span> {t.nav.products}
        </h1>

        <div style={{ position: "relative", marginBottom: "2rem" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن قطعة فنية تلائم منزلك..." : "Search for a piece that fits your home..."}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: "14px",
              border: "1px solid #E8DDD0", fontSize: "1rem", outline: "none",
              boxSizing: "border-box", background: "#fff", fontFamily: "Cairo",
              boxShadow: "0 2px 10px rgba(0,0,0,0.01)"
            }}
          />
        </div>

        {/* 🔴 الفئات الديناميكية المسحوبة من الداتا بيز */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "3rem" }}>
          
          {/* زرار "الكل" الثابت */}
          <button 
            onClick={() => setSearchParams({})} 
            className="category-filter-btn"
            style={{
              border: category === "all" ? "1px solid #111" : "1px solid #E8DDD0",
              background: category === "all" ? "#111" : "#fff",
              color: category === "all" ? "#fff" : "#3D2B1F",
            }}
          >
            {t.categories?.all || (lang === "ar" ? "الكل" : "All")}
          </button>

          {/* طباعة الأقسام الحقيقية */}
          {categories.map((cat) => {
            const catId = cat.slug || cat.id;
            return (
              <button 
                key={catId} 
                onClick={() => setSearchParams({ category: catId })} 
                className="category-filter-btn"
                style={{
                  border: category === catId ? "1px solid #111" : "1px solid #E8DDD0",
                  background: category === catId ? "#111" : "#fff",
                  color: category === catId ? "#fff" : "#3D2B1F",
                }}
              >
                {lang === "ar" ? cat.nameAr : (cat.nameEn || cat.nameAr)}
              </button>
            );
          })}
        </div>

        {/* شبكة عرض المنتجات المتجاوبة */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#8B7355" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🕯️</div>
            <p style={{ fontWeight: "600", fontSize: "1.1rem" }}>{t.noResults}</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "2rem 1.5rem", flexWrap: "wrap", justifyItems: "flex-start" }}>
            {filtered.map((p) => {
              const hasOldPrice = p.oldPrice && p.oldPrice > p.price;
              const imageUrl = getDisplayImage(p.imageUrl);

              return (
                <div key={p.id} className="lemo-product-card">
                  
                  <div className="lemo-img-container">
                    <Link to={`/products/${p.id}`}>
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="lemo-product-img" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "3rem" }}>🕯️</div>
                      )}
                    </Link>
                    
                    <div style={{ position: "absolute", top: "12px", right: "12px", left: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
                      <div>
                        {hasOldPrice && (
                          <span style={{ background: "#E74C3C", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                            {lang === "ar" ? "تخفيض" : "Sale"}
                          </span>
                        )}
                        {p.isNew && !hasOldPrice && (
                          <span style={{ background: "#C9A96E", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                            {t.products.new}
                          </span>
                        )}
                      </div>
                      {p.isBestSeller && (
                        <span style={{ background: "#111", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                          ✦
                        </span>
                      )}
                    </div>

                    <div className="lemo-action-overlay">
                      <button 
                        onClick={() => addToCart(p)} 
                        disabled={p.stock === 0} 
                        style={{
                          flex: 1, background: p.stock === 0 ? "#E8DDD0" : "#111",
                          color: "#fff", border: "none", borderRadius: "8px",
                          padding: "10px", cursor: p.stock === 0 ? "not-allowed" : "pointer",
                          fontWeight: "700", fontSize: "0.85rem", fontFamily: "Cairo", transition: "background 0.2s"
                        }}
                      >
                        {p.stock === 0 ? t.products.outOfStock : t.products.addToCart}
                      </button>
                      <button 
                        onClick={() => toggleWishlist(p)} 
                        style={{
                          background: "#fff", border: "1px solid #E8DDD0",
                          borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        {isInWishlist(p.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>
                  
                  <Link to={`/products/${p.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "1.2rem 1rem" }}>
                      <h3 style={{ margin: "0 0 6px 0", color: "#111", fontSize: "1rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {field(p, "name")}
                      </h3>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                        <span style={{ color: hasOldPrice ? "#E74C3C" : "#C9A96E", fontWeight: "900", fontSize: "1.1rem" }}>
                          {p.price} {t.currency}
                        </span>
                        {hasOldPrice && (
                          <span style={{ color: "#A89A8E", textDecoration: "line-through", fontSize: "0.85rem", fontWeight: "600" }}>
                            {p.oldPrice} {t.currency}
                          </span>
                        )}
                      </div>

                      {p.showStock && p.stock > 0 && p.stock <= 10 && (
                        <p style={{ color: "#E67E22", fontSize: "0.75rem", fontWeight: "700", margin: "8px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                          ⏳ {lang === "ar" ? `متبقي ${p.stock} فقط!` : `Only ${p.stock} left!`}
                        </p>
                      )}
                    </div>
                  </Link>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}