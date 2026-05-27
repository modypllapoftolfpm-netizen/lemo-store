import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import { logOut } from "../../firebase/auth";

// 1. اللوجو الفخم (متبرمج ككتلة واحدة عشان ميضربش)
const LemoLogo = () => (
  <div dir="ltr" style={{
    display: "flex",
    flexDirection: "column",
    width: "max-content",
    transform: "scale(0.85)",
    transformOrigin: "right center", // عشان يفضل لازق في اليمين
    userSelect: "none"
  }}>
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      borderTop: "3px solid #3D2B1F",
      borderLeft: "3px solid #3D2B1F",
      borderRight: "3px solid #3D2B1F",
      padding: "8px 12px 6px 12px",
    }}>
      <span style={{ fontSize: "28px", fontWeight: "900", color: "#3D2B1F", fontFamily: "Arial, sans-serif", lineHeight: 1, letterSpacing: "1px" }}>
        LEM
      </span>
      <div style={{ 
        width: "24px", height: "24px", 
        border: "3px solid #3D2B1F", borderRadius: "50%", 
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M12 3C12 3 9 7.5 9 11.5C9 13.2 10.3 14.5 12 14.5C13.7 14.5 15 13.2 15 11.5C15 7.5 12 3 12 3Z" fill="#3D2B1F" />
          <path d="M5 13C6.5 17 9 20 12 20C15 20 17.5 17 19 13" fill="none" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ height: "3px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
      <span style={{ 
        padding: "0 6px", fontSize: "7.5px", fontWeight: "900", 
        color: "#3D2B1F", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap"
      }}>
        ART DESIGNS & CANDLES
      </span>
      <div style={{ height: "3px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
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
    // التعديل الجذري: استخدام Grid لتقسيم الشاشة 3 أجزاء محكمة مستحيل تتداخل
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #f0e8df",
      padding: "0 2rem",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr", // جزء يمين، جزء في النص بالظبط، جزء شمال
      alignItems: "center",
      height: "75px",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 15px rgba(0,0,0,0.02)",
      fontFamily: "Cairo, sans-serif"
    }}>
      
      {/* 1. منطقة اليمين (اللوجو) */}
      <div style={{ justifySelf: "start" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <LemoLogo />
        </Link>
      </div>

      {/* 2. منطقة المنتصف (الروابط) */}
      <div style={{ justifySelf: "center", display: "flex", gap: "2rem", alignItems: "center" }}>
        {[
          { to: "/", label: t.nav.home },
          { to: "/products", label: t.nav.products },
        ].map((link) => (
          <Link key={link.to} to={link.to} style={{
            textDecoration: "none",
            color: isActive(link.to) ? "#C9A96E" : "#3D2B1F",
            fontWeight: isActive(link.to) ? "700" : "600",
            fontSize: "0.95rem",
            borderBottom: isActive(link.to) ? "2px solid #C9A96E" : "2px solid transparent",
            paddingBottom: "4px",
            transition: "all 0.2s"
          }}>{link.label}</Link>
        ))}

        {isLoggedIn && (
          <>
            <Link to="/wishlist" style={{ textDecoration: "none", color: isActive("/wishlist") ? "#C9A96E" : "#3D2B1F", fontWeight: isActive("/wishlist") ? "700" : "600", fontSize: "0.95rem" }}>
              ❤️ {t.nav.wishlist}
            </Link>
            <Link to="/orders" style={{ textDecoration: "none", color: isActive("/orders") ? "#C9A96E" : "#3D2B1F", fontWeight: isActive("/orders") ? "700" : "600", fontSize: "0.95rem" }}>
              {t.nav.orders}
            </Link>
          </>
        )}

        {isAdmin && (
          <Link to="/admin" style={{
            textDecoration: "none", color: "#fff",
            background: "#3D2B1F", padding: "6px 16px",
            borderRadius: "20px", fontWeight: "700", fontSize: "0.9rem"
          }}>⚙️ {t.nav.admin}</Link>
        )}
      </div>

      {/* 3. منطقة اليسار (الزراير الدائرية بتاعت الفيديو) */}
      <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: "10px" }}>
        
        {/* زرار تغيير اللغة */}
        <button onClick={toggleLang} style={{
          background: "transparent", border: "1px solid #E8DDD0",
          width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer",
          fontWeight: "700", color: "#3D2B1F", fontSize: "0.85rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "0.2s"
        }}>
          {lang === "ar" ? "EN" : "عربي"}
        </button>

        {/* أيقونة السلة */}
        <Link to="/cart" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <div style={{
            background: "transparent", border: "1px solid #E8DDD0",
            width: "42px", height: "42px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", transition: "0.2s"
          }}>
            <span style={{ fontSize: "1.1rem" }}>🛒</span>
            {itemCount > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                background: "#C9A96E", color: "#fff", borderRadius: "50%",
                width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: "700"
              }}>{itemCount}</span>
            )}
          </div>
        </Link>

        {/* زرار الدخول / الخروج */}
        {isLoggedIn ? (
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid #E8DDD0",
            color: "#8B7355", padding: "8px 20px", marginLeft: "5px",
            borderRadius: "20px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600"
          }}>{t.nav.logout}</button>
        ) : (
          <Link to="/login" style={{
            background: "transparent", border: "1px solid #E8DDD0",
            color: "#3D2B1F", padding: "8px 20px", marginLeft: "5px",
            borderRadius: "20px", textDecoration: "none",
            fontWeight: "700", fontSize: "0.9rem",
          }}>{t.nav.login}</Link>
        )}
      </div>
      
    </nav>
  );
}