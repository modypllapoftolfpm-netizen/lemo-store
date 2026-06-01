import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { getSettings, updateSettings } from "../firebase/settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeNameAr: "متجر ليمو",
    storeNameEn: "Lemo Store",
    heroTitle: "LEMO STORE… بنبيع إحساس مش منتجات",
    heroDesc: "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك.",
    announcementText: "🚚 شحن مجاني على الطلبات فوق 2000 ج.م | 🎁 تغليف هدايا فاخر بـ 50 ج.م فقط", 
    primaryColor: "#C9A96E",
    darkColor: "#111111",
    bgColor: "#FAF8F5",
    whatsapp: "",
    facebook: "",
    instagram: "",
    email: "" 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      alert("تم حفظ إعدادات المتجر بنجاح ✅");
    } catch {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    }
    setSaving(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#FAF8F5" }}><Navbar /><div style={{ padding: "10rem 2rem", textAlign: "center" }}>جاري التحميل...</div></div>;

  const inputStyle = {
    width: "100%", padding: "12px", marginTop: "6px", 
    borderRadius: "8px", border: "1px solid #E8DDD0", 
    outline: "none", boxSizing: "border-box", fontFamily: "Cairo"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      
      {/* 📱 أكواد التجاوب مع الموبايل */}
      <style>{`
        .admin-container { max-width: 800px; margin: 0 auto; padding: 3rem 2rem; }
        .admin-card { background: #fff; border-radius: 24px; padding: 2.5rem; box-shadow: 0 4px 25px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 1.5rem; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .section-box { padding: 1.5rem; border-radius: 16px; border: 1px solid #E8DDD0; background: #FAF8F5; }
        
        /* 📱 إعدادات الموبايل (شاشات أصغر من 768px) */
        @media (max-width: 768px) {
          .admin-container { padding: 2rem 1rem; }
          .admin-card { padding: 1.5rem; border-radius: 16px; }
          .grid-2 { grid-template-columns: 1fr; } /* هيخلي المربعات تحت بعض بدل جمب بعض */
          .section-box { padding: 1rem; }
        }
      `}</style>

      <div className="admin-container">
        <h1 style={{ color: "#111", marginBottom: "1.5rem", fontSize: "1.8rem" }}>⚙️ إعدادات المتجر</h1>
        <form onSubmit={handleSubmit} className="admin-card">
          
          <div className="section-box">
            <h3 style={{ marginTop: 0, color: "#3D2B1F", fontSize: "1.1rem" }}>🏷️ بيانات المتجر الأساسية</h3>
            <div className="grid-2">
              <div>
                <label style={{ fontWeight: "700", color: "#666" }}>اسم المتجر (عربي)</label>
                <input name="storeNameAr" value={settings.storeNameAr} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontWeight: "700", color: "#666" }}>اسم المتجر (إنجليزي)</label>
                <input name="storeNameEn" value={settings.storeNameEn} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="section-box">
            <h3 style={{ marginTop: 0, color: "#3D2B1F", fontSize: "1.1rem" }}>✨ نصوص الواجهة (Hero)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontWeight: "700", color: "#666" }}>العنوان الرئيسي (الجملة الكبيرة)</label>
                <input name="heroTitle" value={settings.heroTitle} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontWeight: "700", color: "#666" }}>الوصف (تحت العنوان)</label>
                <textarea name="heroDesc" value={settings.heroDesc} onChange={handleChange} style={{ ...inputStyle, height: "80px", resize: "none" }} />
              </div>
            </div>
          </div>

          {/* 🛠️ شريط العروض (النص الحر) */}
          <div className="section-box" style={{ background: "#FFF9E6", border: "1px solid #FFE699" }}>
            <h3 style={{ marginTop: 0, color: "#B8860B", fontSize: "1.1rem" }}>📢 شريط الإعلانات والعروض</h3>
            <div>
              <label style={{ fontWeight: "700", color: "#8B7355" }}>النص الظاهر في الشريط أسفل القسم الرئيسي</label>
              <input name="announcementText" value={settings.announcementText} onChange={handleChange} placeholder="مثال: شحن مجاني بمناسبة الافتتاح..." style={inputStyle} />
            </div>
          </div>

          <div className="section-box">
            <h3 style={{ marginTop: 0, color: "#3D2B1F", fontSize: "1.1rem" }}>🌐 روابط التواصل</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <input placeholder="واتساب" name="whatsapp" value={settings.whatsapp} onChange={handleChange} style={inputStyle} />
              <input placeholder="فيسبوك" name="facebook" value={settings.facebook} onChange={handleChange} style={inputStyle} />
              <input placeholder="انستجرام" name="instagram" value={settings.instagram} onChange={handleChange} style={inputStyle} />
              <input placeholder="البريد الإلكتروني (الجيميل)" name="email" value={settings.email} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding: "15px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem", transition: "0.3s", marginTop: "10px" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}