import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import { logOut } from "../../firebase/auth";

export default function Navbar() {
  const { isLoggedIn, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #f0e8df",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "70px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 20px rgba(201,169,110,0.1)"
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🕯️</span>
          <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#3D2B1F", letterSpacing: "-0.5px" }}>
            LEMO <span style={{ color: "#C9A96E" }}>Store</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[
            { to: "/", label: t.nav.home },
            { to: "/products", label: t.nav.products },
          ].map((link) => (
            <Link key={link.to} to={link.to} style={{
              textDecoration: "none",
              color: isActive(link.to) ? "#C9A96E" : "#3D2B1F",
              fontWeight: isActive(link.to) ? "700" : "500",
              fontSize: "0.95rem",
              borderBottom: isActive(link.to) ? "2px solid #C9A96E" : "2px solid transparent",
              paddingBottom: "2px",
              transition: "all 0.2s"
            }}>{link.label}</Link>
          ))}

          {isLoggedIn && (
            <>
              <Link to="/wishlist" style={{ textDecoration: "none", color: isActive("/wishlist") ? "#C9A96E" : "#3D2B1F", fontWeight: "500", fontSize: "0.95rem" }}>
                ❤️ {t.nav.wishlist}
              </Link>
              <Link to="/orders" style={{ textDecoration: "none", color: isActive("/orders") ? "#C9A96E" : "#3D2B1F", fontWeight: "500", fontSize: "0.95rem" }}>
                {t.nav.orders}
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" style={{
              textDecoration: "none", color: "#fff",
              background: "#3D2B1F", padding: "6px 14px",
              borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem"
            }}>⚙️ {t.nav.admin}</Link>
          )}
        </div>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Lang Toggle */}
          <button onClick={toggleLang} style={{
            background: "#FAF7F2", border: "1px solid #E8DDD0",
            padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
            fontWeight: "700", color: "#3D2B1F", fontSize: "0.85rem"
          }}>
            {lang === "ar" ? "EN" : "عربي"}
          </button>

          {/* Cart */}
          <Link to="/cart" style={{ textDecoration: "none", position: "relative", display: "flex", alignItems: "center" }}>
            <div style={{
              background: "#FAF7F2", border: "1px solid #E8DDD0",
              borderRadius: "12px", padding: "8px 12px",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span style={{ fontSize: "1.1rem" }}>🛒</span>
              {itemCount > 0 && (
                <span style={{
                  background: "#C9A96E", color: "#fff", borderRadius: "10px",
                  padding: "0 6px", fontSize: "0.75rem", fontWeight: "700"
                }}>{itemCount}</span>
              )}
            </div>
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <button onClick={handleLogout} style={{
              background: "none", border: "1px solid #E8DDD0",
              color: "#8B7355", padding: "8px 16px",
              borderRadius: "20px", cursor: "pointer", fontSize: "0.9rem"
            }}>{t.nav.logout}</button>
          ) : (
            <Link to="/login" style={{
              background: "linear-gradient(135deg, #C9A96E, #b8925a)",
              color: "#fff", padding: "8px 20px",
              borderRadius: "20px", textDecoration: "none",
              fontWeight: "700", fontSize: "0.9rem",
              boxShadow: "0 4px 15px rgba(201,169,110,0.3)"
            }}>{t.nav.login}</Link>
          )}
        </div>
      </nav>
    </>
  );
}