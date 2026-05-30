import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { getSettings, updateSettings } from "../../firebase/settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeNameAr: "متجر ليمو",
    storeNameEn: "Lemo Store",
    // 🛠️ تم إضافة حقول الصفحة الرئيسية
    heroTitle: "LEMO STORE… بنبيع إحساس مش منتجات",
    heroDesc: "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك.",
    primaryColor: "#C9A96E",
    darkColor: "#111111",
    bgColor: "#FAF8F5",
    freeShippingLimit: "500",
    giftFee: "50",
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
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ color: "#111", marginBottom: "2rem" }}>⚙️ إعدادات المتجر</h1>
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 🛠️ قسم نصوص الصفحة الرئيسية */}
          <div style={{ background: "#FAF8F5", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E8DDD0" }}>
            <h3 style={{ marginTop: 0, color: "#3D2B1F" }}>✨ نصوص الواجهة (Hero)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontWeight: "700", color: "#666" }}>العنوان الرئيسي</label>
                <input name="heroTitle" value={settings.heroTitle} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontWeight: "700", color: "#666" }}>الوصف (تحت العنوان)</label>
                <textarea name="heroDesc" value={settings.heroDesc} onChange={handleChange} style={{ ...inputStyle, height: "80px", resize: "none" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontWeight: "700", color: "#666" }}>سعر تغليف الهدايا (ج.م)</label>
              <input type="number" name="giftFee" value={settings.giftFee} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontWeight: "700", color: "#666" }}>حد الشحن المجاني (ج.م)</label>
              <input type="number" name="freeShippingLimit" value={settings.freeShippingLimit} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ background: "#FAF8F5", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E8DDD0" }}>
            <h3 style={{ marginTop: 0, color: "#3D2B1F" }}>🌐 روابط التواصل</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <input placeholder="واتساب" name="whatsapp" value={settings.whatsapp} onChange={handleChange} style={inputStyle} />
              <input placeholder="فيسبوك" name="facebook" value={settings.facebook} onChange={handleChange} style={inputStyle} />
              <input placeholder="انستجرام" name="instagram" value={settings.instagram} onChange={handleChange} style={inputStyle} />
              <input placeholder="البريد الإلكتروني (الجيميل)" name="email" value={settings.email} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding: "15px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem", transition: "0.3s" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}