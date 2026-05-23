import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";

export default function Wishlist() {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, field } = useLang();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>❤️ {t.nav.wishlist}</h1>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem" }}>❤️</div>
            <p style={{ color: "#8B7355" }}>مفيش منتجات في المفضلة</p>
            <Link to="/products" style={{
              background: "#C9A96E", color: "#fff",
              padding: "12px 30px", borderRadius: "25px",
              textDecoration: "none", fontWeight: "700"
            }}>تسوقي الآن</Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {items.map((item) => (
              <div key={item.id} style={{
                background: "#fff", borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                width: "220px", overflow: "hidden"
              }}>
                <Link to={`/products/${item.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    height: "180px", background: "#FAF7F2",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem"
                  }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "🕯️"}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ margin: "0 0 8px", color: "#3D2B1F", fontSize: "0.95rem" }}>{field(item, "name")}</h3>
                    <p style={{ color: "#C9A96E", fontWeight: "700", margin: 0 }}>{item.price} {t.currency}</p>
                  </div>
                </Link>
                <div style={{ padding: "0 1rem 1rem", display: "flex", gap: "8px" }}>
                  <button onClick={() => addToCart(item)} style={{
                    flex: 1, background: "#C9A96E", color: "#fff",
                    border: "none", borderRadius: "10px", padding: "8px",
                    cursor: "pointer", fontWeight: "600", fontSize: "0.85rem"
                  }}>{t.products.addToCart}</button>
                  <button onClick={() => toggleWishlist(item)} style={{
                    background: "none", border: "1px solid #E8DDD0",
                    borderRadius: "10px", padding: "8px 10px", cursor: "pointer", fontSize: "1rem"
                  }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}