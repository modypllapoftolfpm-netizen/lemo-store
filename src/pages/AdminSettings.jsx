import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/layout/Navbar";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    heroTitleAr: "الشموع الفاخرة والديكور",
    heroTitleEn: "Luxury Candles & Decor",
    heroDescAr: "اكتشف مجموعتنا المميزة المصنوعة يدوياً من أجود الخامات العطرية الآمنة تماماً على منزلك وعائلتك.",
    heroDescEn: "Discover our unique collection handcrafted from the finest aromatic materials, completely safe for your home.",
    freeShippingMin: 2000,
    giftPromoTextAr: "تغليف هدايا مجاني فاخر",
    giftPromoTextEn: "Luxury Gift Wrapping Included",
    whatsapp: "201009633100",
    facebook: "",
    instagram: "",
    email: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "global");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "settings", "global");
      // بنستخدم setDoc مع merge عشان ينشئ الملف لو دي أول مرة نعدل فيها الإعدادات
      await setDoc(docRef, settings, { merge: true });
      alert("✅ تم حفظ إعدادات Lemo Store بنجاح!");
    } catch (error) {
      console.error(error);
      alert("❌ حدث خطأ أثناء الحفظ");
    }
  };

  const inputStyle = { 
    width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "10px", 
    border: "1px solid #E8DDD0", fontSize: "1rem", outline: "none", boxSizing: "border-box" 
  };
  const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "700", color: "#3D2B1F" };

  if (loading) return <div style={{ textAlign: "center", marginTop: "10rem", fontFamily: "Cairo" }}>جاري تحميل الإعدادات...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", paddingBottom: "4rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "2.5rem auto", background: "#fff", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
        <h2 style={{ color: "#3D2B1F", borderBottom: "2px solid #FAF7F2", paddingBottom: "15px", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>⚙️</span> إعدادات متجر Lemo Store
        </h2>

        <section style={{ marginBottom: "2rem", padding: "1.5rem", background: "#FAF8F5", borderRadius: "15px" }}>
          <h3 style={{ color: "#C9A96E", marginBottom: "1.5rem" }}>✨ نصوص الواجهة (Hero)</h3>
          <label style={labelStyle}>عنوان الصفحة (عربي)</label>
          <input value={settings.heroTitleAr} onChange={(e) => setSettings({...settings, heroTitleAr: e.target.value})} style={inputStyle} />
          
          <label style={labelStyle}>وصف الصفحة (عربي)</label>
          <textarea value={settings.heroDescAr} onChange={(e) => setSettings({...settings, heroDescAr: e.target.value})} style={{...inputStyle, height: "100px", resize: "none"}} />
        </section>

        <section style={{ marginBottom: "2rem", padding: "1.5rem", background: "#FAF8F5", borderRadius: "15px" }}>
          <h3 style={{ color: "#C9A96E", marginBottom: "1.5rem" }}>🚚 مصاريف الشحن والعروض</h3>
          <label style={labelStyle}>شحن مجاني عند الشراء بمبلغ أكبر من (ج.م)</label>
          <input type="number" value={settings.freeShippingMin} onChange={(e) => setSettings({...settings, freeShippingMin: Number(e.target.value)})} style={inputStyle} />
          
          <label style={labelStyle}>نص عرض الهدايا (عربي)</label>
          <input value={settings.giftPromoTextAr} onChange={(e) => setSettings({...settings, giftPromoTextAr: e.target.value})} style={inputStyle} />
        </section>

        <button onClick={handleUpdate} style={{ width: "100%", padding: "18px", background: "#111", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "800", fontSize: "1.1rem", transition: "0.3s" }}>
          حفظ كافة الإعدادات
        </button>
      </div>
    </div>
  );
}