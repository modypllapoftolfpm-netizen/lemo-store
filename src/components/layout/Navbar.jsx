import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import { logOut } from "../../firebase/auth";

const LemoLogo = () => (
  <div dir="ltr" style={{ display: "flex", flexDirection: "column", width: "max-content", transform: "scale(0.85)", transformOrigin: "right center", userSelect: "none" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", borderTop: "3px solid #3D2B1F", borderLeft: "3px solid #3D2B1F", borderRight: "3px solid #3D2B1F", padding: "8px 12px 6px 12px" }}>
      <span style={{ fontSize: "28px", fontWeight: "900", color: "#3D2B1F", fontFamily: "Arial, sans-serif", lineHeight: 1, letterSpacing: "1px" }}>LEM</span>
      <div style={{ width: "24px", height: "24px", border: "3px solid #3D2B1F", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 3C12 3 9 7.5 9 11.5C9 13.2 10.3 14.5 12 14.5C13.7 14.5 15 13.2 15 11.5C15 7.5 12 3 12 3Z" fill="#3D2B1F" /><path d="M5 13C6.5 17 9 20 12 20C15 20 17.5 17 19 13" fill="none" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" /></svg>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ height: "3px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
      <span style={{ padding: "0 6px", fontSize: "7.5px", fontWeight: "900", color: "#3D2B1F", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>ART DESIGNS & CANDLES</span>
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
  const [links, setLinks] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then(snap => { if (snap.exists()) setLinks(snap.data()); });
  }, []);

  const handleLogout = async () => { await logOut(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #f0e8df", padding: "0 2rem", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: "75px", position: "sticky", top: 0, zIndex: 1000, fontFamily: "Cairo, sans-serif" }}>
      
      <div style={{ justifySelf: "start" }}>
        <Link to="/" style={{ textDecoration: "none" }}><LemoLogo /></Link>
      </div>

      <div style={{ justifySelf: "center", display: "flex", gap: "2rem", alignItems: "center" }}>
        {[ { to: "/", label: t.nav.home }, { to: "/products", label: t.nav.products } ].map((link) => (
          <Link key={link.to} to={link.to} style={{ textDecoration: "none", color: isActive(link.to) ? "#C9A96E" : "#3D2B1F", fontWeight: isActive(link.to) ? "700" : "600", fontSize: "0.95rem", borderBottom: isActive(link.to) ? "2px solid #C9A96E" : "2px solid transparent", paddingBottom: "4px" }}>{link.label}</Link>
        ))}
        {isLoggedIn && <Link to="/orders" style={{ textDecoration: "none", color: isActive("/orders") ? "#C9A96E" : "#3D2B1F", fontWeight: isActive("/orders") ? "700" : "600", fontSize: "0.95rem" }}>{t.nav.orders}</Link>}
        {isAdmin && <Link to="/admin" style={{ textDecoration: "none", color: "#fff", background: "#3D2B1F", padding: "6px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "0.9rem" }}>⚙️ {t.nav.admin}</Link>}
        
        {/* زرار تواصل معنا المدمج (مكتوب على سطور منفصلة لمنع القص) */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setIsContactOpen(!isContactOpen)} 
            style={{ 
              background: "transparent", 
              border: "1px solid #C9A96E", 
              color: "#3D2B1F", 
              padding: "6px 16px", 
              borderRadius: "20px", 
              cursor: "pointer", 
              fontWeight: "600" 
            }}
          >
            تواصل معنا
          </button>

          {isContactOpen && links && (
            <div style={{ position: "absolute", top: "150%", left: 0, background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.15)", display: "grid", gap: "8px", minWidth: "140px", zIndex: 999 }}>
              <a href={`https://wa.me/${links.whatsapp}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#25D366" }}>واتساب</a>
              <a href={links.facebook} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#4267B2" }}>فيسبوك</a>
              <a href={links.instagram} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#C13584" }}>انستجرام</a>
              <a href={`mailto:${links.email}`} style={{ textDecoration: "none", color: "#D44638" }}>الجيميل</a>
            </div>
          )}
        </div>
      </div>

      <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={toggleLang} style={{ background: "transparent", border: "1px solid #E8DDD0", width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer" }}>{lang === "ar" ? "EN" : "عربي"}</button>
        <Link to="/cart" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <div style={{ background: "transparent", border: "1px solid #E8DDD0", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            🛒
            {itemCount > 0 && <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#C9A96E", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.75rem" }}>{itemCount}</span>}
          </div>
        </Link>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #E8DDD0", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}>{t.nav.logout}</button>
        ) : (
          <Link to="/login" style={{ background: "transparent", border: "1px solid #E8DDD0", padding: "8px 20px", borderRadius: "20px", textDecoration: "none", color: "#3D2B1F" }}>{t.nav.login}</Link>
        )}
      </div>
    </nav>
  );
}