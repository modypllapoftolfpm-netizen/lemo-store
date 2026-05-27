import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import { logOut } from "../../firebase/auth";

const LemoLogo = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "2.5px solid #3D2B1F",
    padding: "6px 14px",
    position: "relative",
    marginRight: "20px",
    backgroundColor: "#fff",
    userSelect: "none"
  }}>
    <span style={{ fontSize: "24px", fontWeight: "900", color: "#3D2B1F", letterSpacing: "1px", fontFamily: "Arial, sans-serif" }}>
      LEM
    </span>
    <div style={{ 
      width: "28px", 
      height: "28px", 
      border: "2.5px solid #3D2B1F", 
      borderRadius: "50%", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center"
    }}>
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M12 3C12 3 9 7.5 9 11.5C9 13.2 10.3 14.5 12 14.5C13.7 14.5 15 13.2 15 11.5C15 7.5 12 3 12 3Z" fill="#3D2B1F" />
        <path d="M5 13C6.5 17 9 20 12 20C15 20 17.5 17 19 13" fill="none" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
    <div style={{ position: "absolute", bottom: "-6px", right: "0", left: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ height: "2.5px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
      <span style={{ 
        padding: "0 5px", 
        fontSize: "7px", 
        fontWeight: "800", 
        color: "#3D2B1F", 
        letterSpacing: "0.5px", 
        backgroundColor: "#fff",
        fontFamily: "Arial, sans-serif",
        whiteSpace: "nowrap"
      }}>
        ART DESIGNS & CANDLES
      </span>
      <div style={{ height: "2.5px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
    </div>
  </div>
);

export default function Navbar() {
  const { isLoggedIn, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
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
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <LemoLogo />
      </Link>

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

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={toggleLang} style={{
          background: "#FAF7F2", border: "1px solid #E8DDD0",
          padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
          fontWeight: "700", color: "#3D2B1F", fontSize: "0.85rem"
        }}>
          {lang === "ar" ? "EN" : "عربي"}
        </button>

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
  );
}