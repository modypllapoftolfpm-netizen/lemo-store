import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { getSettings, updateSettings, uploadBannerImage } from "../../firebase/settings";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "LEMO Store",
    storeNameAr: "ليمو ستور",
    email: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    address: "",
    freeShippingMin: 0,
    heroTitleAr: "شموع فاخرة وهدايا مميزة",
    heroTitleEn: "Luxury Candles & Gifts",
    heroSubtitleAr: "اكتشفي عالم من الرائحة والجمال",
    heroSubtitleEn: "Discover a world of scent and beauty",
    primaryColor: "#C9A96E",
    darkColor: "#3D2B1F",
    bgColor: "#FAF7F2",
    logoUrl: "",
  });

  useEffect(() => {
    getSettings().then((s) => { if (s) setSettings((prev) => ({ ...prev, ...s })); });
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateSettings(settings);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { url } = await uploadBannerImage(file);
    setSettings({ ...settings, logoUrl: url });
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px", borderRadius: "8px",
    border: "1px solid #E8DDD0", outline: "none",
    boxSizing: "border-box", marginBottom: "12px", fontSize: "0.95rem"
  };

  const tabs = [
    { key: "general", label: "⚙️ عام" },
    { key: "home", label: "🏠 الرئيسية" },
    { key: "colors", label: "🎨 الألوان" },
    { key: "contact", label: "📞 التواصل" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>⚙️ إعدادات المتجر</h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "2rem", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "2px solid #C9A96E", background: activeTab === tab.key ? "#C9A96E" : "#fff", color: activeTab === tab.key ? "#fff" : "#C9A96E" }}>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>

            {activeTab === "general" && (
              <div>
                <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>معلومات المتجر</h2>
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>اسم المتجر (عربي)</label>
                <input name="storeNameAr" value={settings.storeNameAr} onChange={handleChange} style={inputStyle} />
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>اسم المتجر (إنجليزي)</label>
                <input name="storeName" value={settings.storeName} onChange={handleChange} style={inputStyle} />
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>حد الشحن المجاني (ج.م)</label>
                <input name="freeShippingMin" type="number" value={settings.freeShippingMin} onChange={handleChange} style={inputStyle} />
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>شعار المتجر (Logo)</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={inputStyle} />
                {settings.logoUrl && <img src={settings.logoUrl} alt="logo" style={{ height: "60px", marginBottom: "12px", borderRadius: "8px" }} />}
              </div>
            )}

            {activeTab === "home" && (
              <div>
                <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>نصوص الصفحة الرئيسية</h2>
                {[
                  { name: "heroTitleAr", label: "عنوان البانر (عربي)" },
                  { name: "heroTitleEn", label: "عنوان البانر (إنجليزي)" },
                  { name: "heroSubtitleAr", label: "النص الفرعي (عربي)" },
                  { name: "heroSubtitleEn", label: "النص الفرعي (إنجليزي)" },
                ].map((f) => (
                  <div key={f.name}>
                    <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{f.label}</label>
                    <input name={f.name} value={settings[f.name]} onChange={handleChange} style={inputStyle} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "colors" && (
              <div>
                <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>ألوان الموقع</h2>
                {[
                  { name: "primaryColor", label: "اللون الذهبي الرئيسي" },
                  { name: "darkColor", label: "اللون الداكن" },
                  { name: "bgColor", label: "لون الخلفية" },
                ].map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <input type="color" name={c.name} value={settings[c.name]} onChange={handleChange} style={{ width: "50px", height: "50px", borderRadius: "8px", border: "none", cursor: "pointer" }} />
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: "600", color: "#3D2B1F" }}>{c.label}</p>
                      <p style={{ margin: 0, color: "#8B7355", fontSize: "0.9rem" }}>{settings[c.name]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "contact" && (
              <div>
                <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>بيانات التواصل</h2>
                {[
                  { name: "email", label: "📧 البريد الإلكتروني" },
                  { name: "phone", label: "📞 رقم الهاتف" },
                  { name: "whatsapp", label: "💬 واتساب" },
                  { name: "instagram", label: "📸 انستجرام (رابط)" },
                  { name: "facebook", label: "👥 فيسبوك (رابط)" },
                  { name: "address", label: "📍 العنوان" },
                ].map((f) => (
                  <div key={f.name}>
                    <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{f.label}</label>
                    <input name={f.name} value={settings[f.name] || ""} onChange={handleChange} style={inputStyle} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", marginTop: "1rem", background: saved ? "#4CAF50" : "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}>
            {saved ? "✅ تم الحفظ!" : loading ? "جاري الحفظ..." : "💾 حفظ الإعدادات"}
          </button>
        </form>
      </div>
    </div>
  );
}