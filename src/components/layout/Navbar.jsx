import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import { logOut } from "../../firebase/auth";

export default function Navbar() {
  const { isLoggedIn, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #E8DDD0",
      padding: "0 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "70px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "#C9A96E", fontFamily: "serif" }}>
          🕯️ LEMO
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#3D2B1F", fontWeight: "500" }}>{t.nav.home}</Link>
        <Link to="/products" style={{ textDecoration: "none", color: "#3D2B1F", fontWeight: "500" }}>{t.nav.products}</Link>

        {isLoggedIn && (
          <>
            <Link to="/wishlist" style={{ textDecoration: "none", color: "#3D2B1F" }}>❤️ {t.nav.wishlist}</Link>
            <Link to="/orders" style={{ textDecoration: "none", color: "#3D2B1F" }}>{t.nav.orders}</Link>
          </>
        )}

        {isAdmin && (
          <Link to="/admin" style={{ textDecoration: "none", color: "#C9A96E", fontWeight: "700" }}>⚙️ {t.nav.admin}</Link>
        )}

        {/* Cart */}
        <Link to="/cart" style={{ textDecoration: "none", position: "relative" }}>
          <span style={{ fontSize: "1.5rem" }}>🛒</span>
          {itemCount > 0 && (
            <span style={{
              position: "absolute", top: "-8px", right: "-8px",
              background: "#C9A96E", color: "#fff", borderRadius: "50%",
              width: "20px", height: "20px", fontSize: "12px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{itemCount}</span>
          )}
        </Link>

        {/* Auth */}
        {isLoggedIn ? (
          <button onClick={handleLogout} style={{
            background: "none", border: "1px solid #C9A96E", color: "#C9A96E",
            padding: "6px 16px", borderRadius: "20px", cursor: "pointer"
          }}>{t.nav.logout}</button>
        ) : (
          <Link to="/login" style={{
            background: "#C9A96E", color: "#fff",
            padding: "6px 16px", borderRadius: "20px", textDecoration: "none"
          }}>{t.nav.login}</Link>
        )}

        {/* Language toggle */}
        <button onClick={toggleLang} style={{
          background: "#FAF7F2", border: "1px solid #E8DDD0",
          padding: "6px 12px", borderRadius: "20px", cursor: "pointer",
          fontWeight: "600", color: "#3D2B1F"
        }}>
          {lang === "ar" ? "EN" : "عربي"}
        </button>
      </div>
    </nav>
  );
}