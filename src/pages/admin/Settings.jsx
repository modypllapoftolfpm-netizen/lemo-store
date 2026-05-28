import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { getSettings, updateSettings } from "../../firebase/settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeNameAr: "متجر ليمو",
    storeNameEn: "Lemo Store",
    primaryColor: "#C9A96E",
    darkColor: "#111111",
    bgColor: "#FAF8F5",
    freeShippingLimit: "500",
    giftFee: "50", // تم إضافة حقل سعر التغليف هنا
    whatsapp: "",
    facebook: "",
    instagram: ""
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
      alert("تم حفظ إعدادات المتجر وسعر التغليف بنجاح ✅");
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
          <h1 style={{ color: "#111111", fontSize: "2.4rem", fontWeight: "800", margin: 0 }}>⚙️ إعدادات المتجر</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* حقل سعر التغليف */}
          <div style={{ background: "#FAF8F5", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E8DDD0" }}>
            <label style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>سعر تغليف الهدايا (ج.م)</label>
            <input 
              type="number" 
              name="giftFee" 
              value={settings.giftFee || 50} 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px" }} 
            />
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              <label style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>اسم المتجر (بالعربي)</label>
              <input type="text" name="storeNameAr" value={settings.storeNameAr} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <label style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>Store Name (English)</label>
              <input type="text" name="storeNameEn" value={settings.storeNameEn} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px" }} />
            </div>
          </div>

          <div style={{ background: "#FAF8F5", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E8DDD0", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h3 style={{ margin: "0 0 4px 0", color: "#3D2B1F", fontSize: "1.1rem", fontWeight: "700" }}>🌐 روابط التواصل</h3>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>رقم الواتساب</label>
              <input type="text" name="whatsapp" value={settings.whatsapp || ""} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", marginTop: "4px" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>رابط الفيسبوك</label>
              <input type="url" name="facebook" value={settings.facebook || ""} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", marginTop: "4px" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>رابط الإنستجرام</label>
              <input type="url" name="instagram" value={settings.instagram || ""} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", marginTop: "4px" }} />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ width: "100%", padding: "14px", backgroundColor: "#111111", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}