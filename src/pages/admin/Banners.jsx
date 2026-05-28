import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import Navbar from "../../components/layout/Navbar";
import { subscribeToBanners, addBanner, deleteBanner, updateBanner, subscribeToCategories, addCategory, updateCategory, deleteCategory } from "../../firebase/settings";

const SECTIONS = [
  { key: "hero", label: "البانر الرئيسي للموقع", desc: "الصورة الكبيرة أعلى الصفحة الرئيسية", preview: "🖼️ [ Hero Banner ]", fields: ["titleAr", "titleEn"] },
  { key: "layout", label: "خلفيات وتنسيقات المتجر العامة", desc: "الصور الخلفية لواجهة التصفح وعرض الهدايا", preview: "✨ [ Layout Assets ]", fields: [] },
];

export default function AdminBanners() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    const unsubBanners = subscribeToBanners(setBanners);
    const unsubCats = subscribeToCategories(setCategories);
    return () => { unsubBanners(); unsubCats(); };
  }, []);

  const getBanner = (key) => banners.find((b) => b.sectionKey === key);

  const handleBannerUpload = async (sectionKey, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [sectionKey]: true }));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      const existing = getBanner(sectionKey);
      if (existing) await updateBanner(existing.id, { imageUrl: base64 });
      else await addBanner({ sectionKey, imageUrl: base64, order: 0 });
      setUploading((prev) => ({ ...prev, [sectionKey]: false }));
      alert("تم رفع الصورة بنجاح ✅");
    };
  };

  const handleFieldChange = (sectionKey, field, value) => {
    setFormData((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [field]: value } }));
  };

  const handleSaveText = async (sectionKey) => {
    const existing = getBanner(sectionKey);
    const data = formData[sectionKey] || {};
    if (existing) await updateBanner(existing.id, data);
    else await addBanner({ sectionKey, imageUrl: "", ...data });
    alert("تم حفظ النصوص بنجاح ✅");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "2rem" }}>
        
        {/* لوحة التحكم في البانرات والخلفيات */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ color: "#3D2B1F", fontWeight: "800" }}>🖼️ صور وتنسيقات الموقع</h2>
          {SECTIONS.map((section) => {
            const banner = getBanner(section.key);
            return (
              <div key={section.key} style={{ background: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #E8DDD0" }}>
                <h3 style={{ margin: "0 0 1rem 0" }}>{section.label}</h3>
                
                {section.fields.map((f) => (
                  <div key={f} style={{ marginBottom: "10px" }}>
                    <input 
                      placeholder={f === "titleAr" ? "العنوان (عربي)" : "Title (English)"}
                      defaultValue={banner?.[f] || ""}
                      onChange={(e) => handleFieldChange(section.key, f, e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                    />
                  </div>
                ))}
                
                {section.fields.length > 0 && (
                  <button onClick={() => handleSaveText(section.key)} style={{ background: "#3D2B1F", color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", marginBottom: "1rem" }}>
                    حفظ النصوص
                  </button>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="file" onChange={(e) => handleBannerUpload(section.key, e.target.files[0])} />
                  {banner?.imageUrl && <img src={banner.imageUrl} style={{ width: "50px", height: "50px", objectFit: "cover" }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}