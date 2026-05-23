import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useLang } from "../context/LangContext";
import { subscribeToProducts } from "../firebase/products";

export default function Products() {
  const { t, field } = useLang();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";

  useEffect(() => {
    const unsub = subscribeToProducts(setProducts);
    return unsub;
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = field(p, "name").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>📦 {t.nav.products}</h1>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ابحث عن منتج..."
          style={{
            width: "100%", padding: "12px 16px", borderRadius: "12px",
            border: "1px solid #E8DDD0", fontSize: "1rem", outline: "none",
            marginBottom: "1.5rem", boxSizing: "border-box", background: "#fff"
          }}
        />

        {/* Categories */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "2rem" }}>
          {["all", "gifts", "scented", "decorative", "body"].map((cat) => (
            <button key={cat} onClick={() => setSearchParams(cat === "all" ? {} : { category: cat })} style={{
              padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontWeight: "600",
              border: "2px solid #C9A96E",
              background: category === cat ? "#C9A96E" : "#fff",
              color: category === cat ? "#fff" : "#C9A96E",
            }}>{t.categories[cat]}</button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#8B7355" }}>
            <div style={{ fontSize: "4rem" }}>🔍</div>
            <p>{t.noResults}</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {filtered.map((p) => (
              <div key={p.id} style={{
                background: "#fff", borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                width: "220px", overflow: "hidden"
              }}>
                <Link to={`/products/${p.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      height: "200px", background: "#FAF7F2",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem"
                    }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : "🕯️"}
                    </div>
                    {p.isNew && <span style={{ position: "absolute", top: "10px", right: "10px", background: "#C9A96E", color: "#fff", padding: "2px 10px", borderRadius: "10px", fontSize: "0.8rem" }}>{t.products.new}</span>}
                    {p.isBestSeller && <span style={{ position: "absolute", top: "10px", left: "10px", background: "#3D2B1F", color: "#fff", padding: "2px 10px", borderRadius: "10px", fontSize: "0.8rem" }}>⭐</span>}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ margin: "0 0 8px", color: "#3D2B1F", fontSize: "0.95rem" }}>{field(p, "name")}</h3>
                    <p style={{ color: "#C9A96E", fontWeight: "700", margin: 0 }}>{p.price} {t.currency}</p>
                  </div>
                </Link>
                <div style={{ padding: "0 1rem 1rem", display: "flex", gap: "8px" }}>
                  <button onClick={() => addToCart(p)} disabled={p.stock === 0} style={{
                    flex: 1, background: p.stock === 0 ? "#E8DDD0" : "#C9A96E",
                    color: "#fff", border: "none", borderRadius: "10px",
                    padding: "8px", cursor: p.stock === 0 ? "not-allowed" : "pointer",
                    fontWeight: "600", fontSize: "0.85rem"
                  }}>{p.stock === 0 ? t.products.outOfStock : t.products.addToCart}</button>
                  <button onClick={() => toggleWishlist(p)} style={{
                    background: "none", border: "1px solid #E8DDD0",
                    borderRadius: "10px", padding: "8px 10px", cursor: "pointer", fontSize: "1rem"
                  }}>{isInWishlist(p.id) ? "❤️" : "🤍"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}