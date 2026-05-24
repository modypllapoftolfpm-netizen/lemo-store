import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { 
  subscribeToBanners, addBanner, deleteBanner, updateBanner, uploadBannerImage,
  subscribeToCategories, addCategory, updateCategory, deleteCategory, uploadCategoryImage 
} from "../../firebase/settings";

const SECTIONS = [
  { key: "hero", label: "البانر الرئيسي للموقع", desc: "الصورة الكبيرة أعلى الصفحة الرئيسية", preview: "🖼️ [ Hero Banner ]", fields: ["titleAr", "titleEn"] },
  { key: "backgrounds", label: "خلفيات وتنسيقات المتجر العامة", desc: "الصور الخلفية لواجهة التصفح وعرض الهدايا", preview: "✨ [ Layout Assets ]", fields: [] },
];

export default function AdminBanners() {
  // ─── كود الفئات (Categories State) ──────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ nameAr: "", nameEn: "", slug: "" });
  const [catEditId, setCatEditId] = useState(null);
  const [catImage, setCatImage] = useState(null);
  const [catUploading, setCatUploading] = useState(false);

  // ─── كود صور الموقع (Banners State) ─────────────────────────────────────
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const unsubBanners = subscribeToBanners(setBanners);
    const unsubCategories = subscribeToCategories(setCategories);
    return () => { unsubBanners(); unsubCategories(); };
  }, []);

  // ─── عمليات إدارة الفئات ────────────────────────────────────────────────
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setCatUploading(true);
    try {
      const cleanSlug = catForm.slug.toLowerCase().replace(/\s+/g, "-");
      const data = { nameAr: catForm.nameAr, nameEn: catForm.nameEn, slug: cleanSlug };

      if (catEditId) {
        let updateData = { ...data };
        if (catImage) {
          const currentCat = categories.find(c => c.id === catEditId);
          if (currentCat?.imagePath) await deleteCategory(catEditId, currentCat.imagePath);
          const uploaded = await uploadCategoryImage(catImage, catEditId);
          updateData.imageUrl = uploaded.url;
          updateData.imagePath = uploaded.path;
        }
        await updateCategory(catEditId, updateData);
        setCatEditId(null);
      } else {
        if (!catImage) { alert("برجاء اختيار صورة غلاف للفئة"); setCatUploading(false); return; }
        const docRef = await addCategory({ ...data, imageUrl: "", imagePath: "" });
        const uploaded = await uploadCategoryImage(catImage, docRef.id);
        await updateCategory(docRef.id, { imageUrl: uploaded.url, imagePath: uploaded.path });
      }
      setCatForm({ nameAr: "", nameEn: "", slug: "" });
      setCatImage(null);
      alert("تم حفظ الفئة بنجاح ✅");
    } catch { alert("حدث خطأ أثناء حفظ الفئة"); }
    setCatUploading(false);
  };

  const handleCatEdit = (cat) => {
    setCatEditId(cat.id);
    setCatForm({ nameAr: cat.nameAr || "", nameEn: cat.nameEn || "", slug: cat.slug || "" });
  };

  // ─── عمليات إدارة صور الموقع ─────────────────────────────────────────────
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

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        
        {/* هيدر اللوحة */}
        <h1 style={{ color: "#3D2B1F", marginBottom: "0.5rem" }}>🖼️ لوحة إدارة الفئات وصور ليمو لوكس</h1>
        <p style={{ color: "#8B7355", marginBottom: "2rem" }}>تحكم كامل في هيكلة تصنيفات الشموع الفاخرة وخلفيات الموقع</p>

        {/* ─── 1) لوحة التحكم في الفئات ─── */}
        <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginBottom: "2.5rem" }}>
          <h2 style={{ color: "#3D2B1F", marginTop: 0, borderBottom: "2px solid #FAF7F2", paddingBottom: "10px" }}>🏷️ إضافة وإدارة فئات الموقع</h2>
          
          <form onSubmit={handleCatSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end", marginTop: "15px" }}>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F" }}>الاسم بالعربي</label>
              <input type="text" value={catForm.nameAr} onChange={(e) => setCatForm({...catForm, nameAr: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", marginTop: "4px" }} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F" }}>الاسم بالإنجليزي</label>
              <input type="text" value={catForm.nameEn} onChange={(e) => setCatForm({...catForm, nameEn: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", marginTop: "4px" }} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F" }}>رابط الفئة (Slug)</label>
              <input type="text" placeholder="scented-candles" value={catForm.slug} onChange={(e) => setCatForm({...catForm, slug: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", marginTop: "4px" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F", display: "block" }}>غلاف الفئة</label>
              <input type="file" accept="image/*" onChange={(e) => setCatImage(e.target.files[0])} style={{ fontSize: "12px", marginTop: "8px" }} />
            </div>
            <button type="submit" disabled={catUploading} style={{ padding: "10px 20px", backgroundColor: "#3D2B1F", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              {catUploading ? "جاري الحفظ..." : catEditId ? "تحديث الفئة" : "إضافة فئة"}
            </button>
          </form>

          {/* جدول عرض الفئات الحالية */}
          <div style={{ marginTop: "20px", overflowX: "auto" }}>
            <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAF7F2", color: "#8B7355" }}>
                  <th width="100">غلاف الفئة</th>
                  <th>الاسم بالعربي</th>
                  <th>الاسم بالإنجليزي</th>
                  <th>الرابط (Slug)</th>
                  <th width="120" style={{ textAlign: "center" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid #FAF7F2" }}>
                    <td><img src={cat.imageUrl || "https://via.placeholder.com/60"} width="60" height="40" style={{ objectFit: "cover", borderRadius: "6px" }} alt="" /></td>
                    <td style={{ fontWeight: "bold" }}>{cat.nameAr}</td>
                    <td>{cat.nameEn}</td>
                    <td><code>{cat.slug}</code></td>
                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => handleCatEdit(cat)} style={{ border: "none", background: "none", color: "#C9A96E", cursor: "pointer", fontWeight: "bold", marginLeft: "10px" }}>تعديل</button>
                      <button onClick={async () => { if(confirm("هل تود حذف هذه الفئة نهائياً؟")) await deleteCategory(cat.id, cat.imagePath) }} style={{ border: "none", background: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── 2) لوحة التحكم في خلفيات وصور الموقع العميقة ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ color: "#3D2B1F", margin: "0 0 5px 0" }}>🖼️ صور وتنسيقات الموقع الخلفية</h2>
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

                  {section.fields.map((f) => (
                    <div key={f} style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "#3D2B1F", fontWeight: "600", marginBottom: "4px" }}>
                        {f === "titleAr" ? "العنوان (عربي)" : "Title (English)"}
                      </label>
                      <input
                        defaultValue={banner?.[f] || ""}
                        onChange={(e) => handleFieldChange(section.key, f, e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}
                      />
                    </div>
                  ))}

                  {section.fields.length > 0 && (
                    <button onClick={() => handleSaveText(section.key)} style={{ background: "#FAF7F2", border: "1px solid #C9A96E", color: "#C9A96E", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", marginBottom: "12px" }}>
                      💾 حفظ نصوص البانر
                    </button>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" }}>
                      {isUploading ? "⏳ جاري الرفع..." : "📤 رفع صورة الخلفية"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleUpload(section.key, e.target.files[0])} disabled={isUploading} />
                    </label>

                    {banner?.imageUrl && (
                      <button onClick={async () => { if(confirm("حذف؟")) await deleteBanner(existing.id, existing.imagePath) }} style={{ background: "#fff0f0", color: "#cc0000", border: "1px solid #ffcccc", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                        🗑️ حذف
                      </button>
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