import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { subscribeToBanners, addBanner, deleteBanner, updateBanner, uploadBannerImage } from "../../firebase/settings";

const SECTIONS = [
  { key: "hero", label: "البانر الرئيسي", desc: "الصورة الكبيرة في أعلى الصفحة الرئيسية", preview: "🖼️ [ صورة كاملة العرض - Hero ]", fields: ["titleAr", "titleEn", "subtitleAr"] },
  { key: "bestSellers", label: "قسم الأكثر مبيعاً", desc: "خلفية قسم Best Sellers", preview: "⭐ [ Best Sellers Section ]", fields: [] },
  { key: "newArrivals", label: "قسم وصل حديثاً", desc: "خلفية قسم New Arrivals", preview: "✨ [ New Arrivals Section ]", fields: [] },
  { key: "categories", label: "قسم التصنيفات", desc: "صور الأقسام الأربعة", preview: "🎁🕯️✨🧴 [ Categories ]", fields: [] },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const unsub = subscribeToBanners(setBanners);
    return unsub;
  }, []);

  const getBanner = (key) => banners.find((b) => b.sectionKey === key);

  const handleUpload = async (sectionKey, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [sectionKey]: true }));
    try {
      const { url, path } = await uploadBannerImage(file);
      const existing = getBanner(sectionKey);
      const data = formData[sectionKey] || {};
      if (existing) {
        await updateBanner(existing.id, { imageUrl: url, imagePath: path, ...data });
      } else {
        await addBanner({ sectionKey, imageUrl: url, imagePath: path, order: 0, ...data });
      }
    } catch { alert("حدث خطأ في الرفع"); }
    setUploading((prev) => ({ ...prev, [sectionKey]: false }));
  };

  const handleFieldChange = (sectionKey, field, value) => {
    setFormData((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [field]: value } }));
  };

  const handleSaveText = async (sectionKey) => {
    const existing = getBanner(sectionKey);
    const data = formData[sectionKey] || {};
    if (existing) await updateBanner(existing.id, data);
    else await addBanner({ sectionKey, imageUrl: "", order: 0, ...data });
    alert("تم الحفظ ✅");
  };

  const handleDelete = async (sectionKey) => {
    const existing = getBanner(sectionKey);
    if (!existing) return;
    if (!window.confirm("هل أنت متأكد؟")) return;
    await deleteBanner(existing.id, existing.imagePath);
  };

  const fieldLabels = {
    titleAr: "العنوان (عربي)",
    titleEn: "Title (English)",
    subtitleAr: "النص الفرعي (عربي)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "0.5rem" }}>🖼️ إدارة صور الموقع</h1>
        <p style={{ color: "#8B7355", marginBottom: "2rem" }}>غيّر صور أي قسم في الموقع بسهولة</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {SECTIONS.map((section) => {
            const banner = getBanner(section.key);
            const isUploading = uploading[section.key];
            return (
              <div key={section.key} style={{ background: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>

                {/* Preview */}
                <div style={{ width: "180px", flexShrink: 0 }}>
                  <div style={{ background: "#FAF7F2", border: "2px dashed #E8DDD0", borderRadius: "12px", height: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: "8px" }}>
                    {banner?.imageUrl ? (
                      <img src={banner.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                    ) : (
                      <div style={{ textAlign: "center", padding: "1rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>📷</div>
                        <p style={{ fontSize: "0.75rem", color: "#8B7355", margin: 0 }}>{section.preview}</p>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#8B7355", textAlign: "center", margin: 0 }}>{section.desc}</p>
                </div>

                {/* Controls */}
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <h3 style={{ color: "#3D2B1F", margin: "0 0 12px", fontSize: "1.1rem", fontWeight: "700" }}>{section.label}</h3>

                  {/* Text Fields */}
                  {section.fields.map((f) => (
                    <div key={f} style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "#3D2B1F", fontWeight: "600", marginBottom: "4px" }}>{fieldLabels[f]}</label>
                      <input
                        defaultValue={banner?.[f] || ""}
                        onChange={(e) => handleFieldChange(section.key, f, e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}
                      />
                    </div>
                  ))}

                  {section.fields.length > 0 && (
                    <button onClick={() => handleSaveText(section.key)} style={{ background: "#FAF7F2", border: "1px solid #C9A96E", color: "#C9A96E", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", marginBottom: "12px" }}>
                      💾 حفظ النصوص
                    </button>
                  )}

                  {/* Upload */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem", boxShadow: "0 4px 15px rgba(201,169,110,0.3)" }}>
                      {isUploading ? "⏳ جاري الرفع..." : "📤 رفع صورة"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleUpload(section.key, e.target.files[0])} disabled={isUploading} />
                    </label>

                    {banner?.imageUrl && (
                      <button onClick={() => handleDelete(section.key)} style={{ background: "#fff0f0", color: "#cc0000", border: "1px solid #ffcccc", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                        🗑️ حذف
                      </button>
                    )}

                    {banner?.imageUrl && (
                      <span style={{ color: "#4CAF50", fontWeight: "600", fontSize: "0.85rem" }}>✅ مرفوعة</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}