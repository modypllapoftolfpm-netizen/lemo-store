import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import { logOut } from "../../firebase/auth";

const LemoLogo = () => (
  <div dir="ltr" style={{ display: "flex", flexDirection: "column", width: "max-content", transform: "scale(0.8)", transformOrigin: "right center", userSelect: "none" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", borderTop: "3px solid #3D2B1F", borderLeft: "3px solid #3D2B1F", borderRight: "3px solid #3D2B1F", padding: "8px 12px 6px 12px" }}>
      <span style={{ fontSize: "24px", fontWeight: "900", color: "#3D2B1F", fontFamily: "Arial, sans-serif", lineHeight: 1, letterSpacing: "1px" }}>LEM</span>
      <div style={{ width: "20px", height: "20px", border: "3px solid #3D2B1F", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 3C12 3 9 7.5 9 11.5C9 13.2 10.3 14.5 12 14.5C13.7 14.5 15 13.2 15 11.5C15 7.5 12 3 12 3Z" fill="#3D2B1F" /><path d="M5 13C6.5 17 9 20 12 20C15 20 17.5 17 19 13" fill="none" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" /></svg>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ height: "3px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
      <span style={{ padding: "0 4px", fontSize: "6.5px", fontWeight: "900", color: "#3D2B1F", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>ART DESIGNS & CANDLES</span>
      <div style={{ height: "3px", backgroundColor: "#3D2B1F", flex: 1 }}></div>
    </div>
  </div>
);

const GlobalFloatingContact = ({ links }) => {
  const [open, setOpen] = useState(false);

  const socials = [
    { href: links?.whatsapp ? "https://wa.me/" + links.whatsapp : "https://wa.me/201009633100", color: "#25D366", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.057 23.535a.5.5 0 00.608.608l5.757-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.073-1.387l-.363-.217-3.767.954.972-3.682-.236-.38A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg> },
    { href: links?.facebook || "https://facebook.com", color: "#1877F2", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
    { href: links?.instagram || "https://instagram.com", color: "#E1306C", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
    { href: links?.email ? "mailto:" + links.email : "mailto:contact@lemo-store.com", color: "#D44638", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-.904.732-1.636 1.636-1.636h.749L12 10.55l9.615-6.73h.749A1.636 1.636 0 0124 5.457z" /></svg> },
  ];

  return (
    <>
      <style>{`
        @keyframes popIn { 0% { transform: translateY(14px) scale(0); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes popOut { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(14px) scale(0); opacity: 0; } }
        .social-icon-btn:hover { transform: scale(1.15) !important; }
        @keyframes blackPulse { 0% { box-shadow: 0 0 0 0 rgba(17,17,17,0.4); } 70% { box-shadow: 0 0 0 12px rgba(17,17,17,0); } 100% { box-shadow: 0 0 0 0 rgba(17,17,17,0); } }
      `}</style>
      <div style={{ position: "fixed", bottom: "24px", left: "24px", display: "inline-flex", flexDirection: "column", alignItems: "center", zIndex: 9999 }}>
        {socials.map((s, i) => (
          <div key={i} style={{ position: "absolute", bottom: open ? (58 + i * 54) + "px" : "0px", left: "50%", marginLeft: "-22px", width: "44px", height: "44px", borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", animation: open ? `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.06}s both` : `popOut 0.2s ease ${(3 - i) * 0.04}s both`, pointerEvents: open ? "auto" : "none", cursor: "pointer", transition: "transform 0.2s" }} className="social-icon-btn" onClick={() => window.open(s.href, "_blank")}>
            {s.icon}
          </div>
        ))}
        <button onClick={() => setOpen(!open)} style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#111", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "background 0.3s, transform 0.3s", transform: open ? "rotate(45deg)" : "rotate(0deg)", animation: !open ? "blackPulse 2s infinite" : "none" }}>
          {open ? <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> : <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" /></svg>}
        </button>
      </div>
    </>
  );
};

export default function Navbar() {
  const { isLoggedIn, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [links, setLinks] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "main")).then(snap => {
      if (snap.exists()) setLinks(snap.data());
    });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false); // قفل القائمة عند تغيير الصفحة
  }, [location]);

  const handleLogout = async () => { await logOut(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ستايلات الـ Media Queries للموبايل والكمبيوتر */}
      <style>{`
        .nav-links-desktop { display: flex; gap: 2rem; align-items: center; }
        .nav-actions-desktop { display: flex; align-items: center; gap: 10px; }
        .burger-menu-btn { display: none; background: transparent; border: none; cursor: pointer; font-size: 1.5rem; color: #3D2B1F; }
        
        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .burger-menu-btn { display: block; }
          .nav-actions-desktop .lang-btn, .nav-actions-desktop .logout-btn { display: none; }
        }
        
        .mobile-menu {
          display: none; position: fixed; top: 75px; left: 0; width: 100%; background: #fff;
          border-bottom: 1px solid #f0e8df; padding: 1.5rem; box-sizing: border-box; z-index: 999;
          flex-direction: column; gap: 1.2rem; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .mobile-menu.open { display: flex; }
      `}</style>

      <nav style={{ background: "#fff", borderBottom: "1px solid #f0e8df", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", height: "75px", position: "sticky", top: 0, zIndex: 1000, fontFamily: "Cairo, sans-serif" }}>
        
        {/* اليسار أو اليمين حسب اللغة: اللوجو وقائمة الموبايل */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="burger-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <Link to="/" style={{ textDecoration: "none" }}><LemoLogo /></Link>
        </div>

        {/* المنتصف: اللينكات للكمبيوتر فقط */}
        <div className="nav-links-desktop">
          {[{ to: "/", label: t.nav.home }, { to: "/products", label: t.nav.products }].map((link) => (
            <Link key={link.to} to={link.to} style={{ textDecoration: "none", color: isActive(link.to) ? "#C9A96E" : "#3D2B1F", fontWeight: isActive(link.to) ? "700" : "600", fontSize: "0.95rem", borderBottom: isActive(link.to) ? "2px solid #C9A96E" : "2px solid transparent", paddingBottom: "4px" }}>
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link to="/orders" style={{ textDecoration: "none", color: isActive("/orders") ? "#C9A96E" : "#3D2B1F", fontWeight: isActive("/orders") ? "700" : "600", fontSize: "0.95rem" }}>
              {t.nav.orders}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ textDecoration: "none", color: "#fff", background: "#3D2B1F", padding: "6px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "0.9rem" }}>
              ⚙️ {t.nav.admin}
            </Link>
          )}
        </div>

        {/* اليمين أو اليسار: الأزرار والسلة */}
        <div className="nav-actions-desktop">
          <button className="lang-btn" onClick={toggleLang} style={{ background: "transparent", border: "1px solid #E8DDD0", width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", fontWeight: "700", color: "#3D2B1F" }}>
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <div style={{ background: "transparent", border: "1px solid #E8DDD0", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              🛒
              {itemCount > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#C9A96E", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  {itemCount}
                </span>
              )}
            </div>
          </Link>

          {isLoggedIn ? (
            <button className="logout-btn" onClick={handleLogout} style={{ background: "transparent", border: "1px solid #E8DDD0", padding: "8px 20px", borderRadius: "20px", cursor: "pointer", color: "#3D2B1F", fontWeight: "600" }}>
              {t.nav.logout}
            </button>
          ) : (
            <Link className="logout-btn" to="/login" style={{ background: "#3D2B1F", border: "none", padding: "8px 20px", borderRadius: "20px", textDecoration: "none", color: "#fff", fontWeight: "700" }}>
              {t.nav.login}
            </Link>
          )}
        </div>

        <GlobalFloatingContact links={links} />
      </nav>

      {/* القائمة المنسدلة الخاصة بالموبايل فقط */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <Link to="/" style={{ textDecoration: "none", color: "#3D2B1F", fontWeight: "700" }}>{t.nav.home}</Link>
        <Link to="/products" style={{ textDecoration: "none", color: "#3D2B1F", fontWeight: "700" }}>{t.nav.products}</Link>
        {isLoggedIn && <Link to="/orders" style={{ textDecoration: "none", color: "#3D2B1F", fontWeight: "700" }}>{t.nav.orders}</Link>}
        {isAdmin && <Link to="/admin" style={{ textDecoration: "none", color: "#C9A96E", fontWeight: "700" }}>⚙️ {t.nav.admin}</Link>}
        <hr style={{ width: "80%", border: "0", borderTop: "1px solid #f0e8df", margin: "5px auto" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <button onClick={toggleLang} style={{ background: "#FAF8F5", border: "1px solid #E8DDD0", padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontWeight: "700" }}>
            {lang === "ar" ? "English" : "عربي"}
          </button>
          {isLoggedIn ? (
            <button onClick={handleLogout} style={{ background: "#ff4d4d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}>{t.nav.logout}</button>
          ) : (
            <Link to="/login" style={{ background: "#3D2B1F", color: "#fff", padding: "8px 20px", borderRadius: "20px", textDecoration: "none" }}>{t.nav.login}</Link>
          )}
        </div>
      </div>
    </>
  );
}