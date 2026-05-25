import React from "react";
import { Link } from "react-router-dom";

export default function LemoAi() {
  return (
    <div style={{
      backgroundColor: "#0F0A07",
      color: "#E8DDD0",
      fontFamily: "Cairo, sans-serif",
      margin: 0,
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
      direction: "rtl"
    }}>
      
      {/* ✦ النجوم الخلفية الخافتة ✦ */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        fontSize: "3rem",
        color: "rgba(201, 169, 110, 0.03)",
        pointerEvents: "none"
      }}>✦ 🕯️ ✦</div>

      {/* ─── القائمة الجانبية (Sidebar) ─── */}
      <div style={{
        width: "260px",
        backgroundColor: "#0A0705",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid rgba(232, 221, 208, 0.05)"
      }}>
        <div style={{
          color: "#C9A96E",
          fontSize: "1.8rem",
          fontWeight: "700",
          marginBottom: "30px",
          textAlign: "center"
        }}>Lemo Store</div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          {["تنسيق هدايا الشموع...", "أفضل الزيوت العطرية...", "تصاميم شموع لديكور المنزل..."].map((item, idx) => (
            <div key={idx} style={{
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(201, 169, 110, 0.05)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
              {item}
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: "1px solid rgba(232, 221, 208, 0.05)", paddingTop: "20px", fontSize: "0.9rem", color: "#8B7355" }}>
          مساعد الديكور والعطور الذكي
        </div>
      </div>

      {/* ─── منطقة المحادثة الرئيسية ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(232, 221, 208, 0.05)" }}>
          <div>
            <span style={{ color: "#C9A96E", fontSize: "2rem", fontWeight: "700" }}>Lemo Store Signature Collection</span>
            <span style={{ color: "#E8DDD0", fontWeight: "300", fontSize: "0.9rem", marginRight: "15px", letterSpacing: "1px" }}>HANDMADE DECOR & CANDLES</span>
          </div>
          <Link to="/" style={{ color: "#C9A96E", textDecoration: "none", fontWeight: "700", fontSize: "0.95rem" }}>العودة للمتجر ←</Link>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", overflowY: "auto" }}>
          <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
            
            <div style={{ fontSize: "3.5rem", fontWeight: "800", marginBottom: "15px", letterSpacing: "1px", color: "#E8DDD0" }}>عالم الفخامة المضاء</div>
            <div style={{ fontSize: "1.2rem", color: "#C9A96E", fontWeight: "400", marginBottom: "50px" }}>تصفح مجموعاتنا الحصرية واستلهم أفكاراً لمنزلك</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {[
                { text: "أفكار هدايا فخمة للمناسبات الخاصة", icon: "🎁" },
                { text: "أفضل الزيوت العطرية الطبيعية للمنزل", icon: "🕯️" },
                { text: "كيفية تنسيق الشموع الديكورية في غرفة المعيشة", icon: "✦" }
              ].map((card, idx) => (
                <div key={idx} style={{
                  backgroundColor: "#0A0705",
                  border: "1px solid rgba(232, 221, 208, 0.05)",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "#C9A96E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(232, 221, 208, 0.05)"; }}>
                  <div style={{ fontSize: "1rem", lineHeight: "1.5", marginBottom: "10px" }}>{card.text}</div>
                  <div style={{ fontSize: "1.5rem", color: "rgba(201, 169, 110, 0.5)", alignSelf: "flex-start" }}>{card.icon}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* مربع الإدخال السفلي السحري */}
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#0A0705", border: "1px solid rgba(232, 221, 208, 0.1)", borderRadius: "30px", padding: "10px 20px", display: "flex", alignItems: "center", width: "100%", maxWidth: "800px" }}>
            <input type="text" placeholder="اسأل عن عطورنا أو تصاميم الشموع..." style={{ flex: 1, background: "transparent", border: "none", color: "#E8DDD0", fontSize: "1.1rem", outline: "none", fontFamily: "Cairo, sans-serif" }} />
            <div style={{ marginRight: "15px", color: "rgba(232, 221, 208, 0.4)", cursor: "pointer", fontSize: "1.2rem" }}>🎤</div>
            <div style={{ marginRight: "15px", color: "rgba(232, 221, 208, 0.4)", cursor: "pointer", fontSize: "1.2rem" }}>🖼️</div>
          </div>
        </div>

      </div>
    </div>
  );
}