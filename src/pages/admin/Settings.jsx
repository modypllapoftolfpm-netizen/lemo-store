import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { getSettings, updateSettings } from "../../firebase/settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeNameAr: "Lemo Store",
    storeNameEn: "Lemo Store",
    primaryColor: "#C9A96E",
    darkColor: "#111111",
    bgColor: "#FAF8F5",
    freeShippingLimit: "500",
    whatsapp: "",
    facebook: "",
    instagram: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      if (Object.keys(data).length > 0) {
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
      alert("تم حفظ إعدادات وروابط التواصل بنجاح ✅");
    } catch {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF8F5" }} dir="rtl">
        <Navbar />
        <div style={{ padding: "10rem 2rem", color: "#8B7355", textAlign: "center", fontSize: "1.2rem" }}>
          جاري تحميل إعدادات المتجر...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem" }}>
        
        <div style={{ marginBottom: "2.5rem", borderBottom: "1px solid #E8DDD0", paddingBottom: "1.5rem" }}>
          <h1 style={{ color: "#111111", fontSize: "2.4rem", fontWeight: "800", margin: 0 }}>⚙️ إعدادات المتجر العامة</h1>
          <p style={{ color: "#8B7355", marginTop: "6px", fontSize: "0.95rem" }}>تخصيص الهوية، الألوان، وروابط منصات التواصل الاجتماعي لبراند Lemo Store</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              <label style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>اسم المتجر (بالعربي)</label>
              <input type="text" name="storeNameAr" value={settings.storeNameAr} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <label style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>Store Name (English)</label>
              <input type="text" name="storeNameEn" value={settings.storeNameEn} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* 🌐 قسم وسائل التواصل الاجتماعي الجديد */}
          <div style={{ background: "#F5F7FA", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h3 style={{ margin: "0 0 4px 0", color: "#1A202C", fontSize: "1.1rem", fontWeight: "700" }}>🌐 روابط ووسائل التواصل</h3>
            
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568" }}>رقم الواتساب (مثال: 2010xxxxxxxx)</label>
              <input type="text" name="whatsapp" value={settings.whatsapp || ""} onChange={handleChange} placeholder="201012345678" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0", marginTop: "4px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568" }}>رابط صفحة الفيسبوك (Facebook URL)</label>
              <input type="url" name="facebook" value={settings.facebook || ""} onChange={handleChange} placeholder="https://facebook.com/..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0", marginTop: "4px", outline: "none", boxSBoxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568" }}>رابط حساب الإنستجرام (Instagram URL)</label>
              <input type="url" name="instagram" value={settings.instagram || ""} onChange={handleChange} placeholder="https://instagram.com/..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0", marginTop: "4px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ background: "#FAF8F5", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E8DDD0", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h3 style={{ margin: "0 0 4px 0", color: "#3D2B1F", fontSize: "1.1rem", fontWeight: "700" }}>🎨 بالتة الألوان الفنية للمتجر</h3>
            
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 180px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>اللون الأساسي</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange} style={{ width: "45px", height: "42px", border: "1px solid #E8DDD0", borderRadius: "8px", cursor: "pointer", background: "none", padding: 0 }} />
                  <input type="text" name="primaryColor" value={settings.primaryColor} onChange={handleChange} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", fontSize: "14px" }} />
                </div>
              </div>

              <div style={{ flex: "1 1 180px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>اللون الداكن</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input type="color" name="darkColor" value={settings.darkColor} onChange={handleChange} style={{ width: "45px", height: "42px", border: "1px solid #E8DDD0", borderRadius: "8px", cursor: "pointer", background: "none", padding: 0 }} />
                  <input type="text" name="darkColor" value={settings.darkColor} onChange={handleChange} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", fontSize: "14px" }} />
                </div>
              </div>

              <div style={{ flex: "1 1 180px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>خلفية الموقع العامة</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input type="color" name="bgColor" value={settings.bgColor} onChange={handleChange} style={{ width: "45px", height: "42px", border: "1px solid #E8DDD0", borderRadius: "8px", cursor: "pointer", background: "none", padding: 0 }} />
                  <input type="text" name="bgColor" value={settings.bgColor} onChange={handleChange} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", fontSize: "14px" }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>الحد الأدنى للشحن المجاني (ج.م)</label>
            <input type="number" name="freeShippingLimit" value={settings.freeShippingLimit} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={saving} style={{ width: "100%", padding: "14px", backgroundColor: "#111111", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "1rem", fontSize: "15px" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
          </button>

        </form>
      </div>
    </div>
  );
}