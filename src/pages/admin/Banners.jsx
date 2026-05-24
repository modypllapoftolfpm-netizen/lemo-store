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

const DEFAULT_CATEGORIES = [
  { id: "scented_default", nameAr: "شموع معطرة", nameEn: "Scented Candles", slug: "scented", isDefault: true },
  { id: "decorative_default", nameAr: "شموع ديكورية", nameEn: "Decorative Candles", slug: "decorative", isDefault: true },
  { id: "gifts_default", nameAr: "هدايا فخمة", nameEn: "Luxury Gifts", slug: "gifts", isDefault: true },
  { id: "body_default", nameAr: "مرطبات الجسم", nameEn: "Body Lotions", slug: "body", isDefault: true },
];

export default function AdminBanners() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [catForm, setCatForm] = useState({ nameAr: "", nameEn: "", slug: "" });
  const [catEditId, setCatEditId] = useState(null);
  const [catImage, setCatImage] = useState(null);
  const [catPreview, setCatPreview] = useState("");
  const [catUploading, setCatUploading] = useState(false);

  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const unsubBanners = subscribeToBanners(setBanners);
    
    const unsubCategories = subscribeToCategories((data) => {
      const merged = DEFAULT_CATEGORIES.map(defCat => {
        const foundInDb = data.find(c => c.slug === defCat.slug || c.id === defCat.id);
        if (foundInDb) {
          return { ...defCat, ...foundInDb, isDefault: false };
        }
        return defCat;
      });

      data.forEach(dbCat => {
        if (!merged.some(m => m.slug === dbCat.slug || m.id === dbCat.id)) {
          merged.push({ ...dbCat, isDefault: false });
        }
      });

      setCategories(merged);
    });

    return () => { unsubBanners(); unsubCategories(); };
  }, []);

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setCatUploading(true);
    try {
      const cleanSlug = catForm.slug.toLowerCase().replace(/\s+/g, "-");
      const currentCat = categories.find(c => c.id === catEditId);
      
      let updateData = { 
        nameAr: catForm.nameAr, 
        nameEn: catForm.nameEn, 
        slug: cleanSlug,
        imageUrl: currentCat?.imageUrl || "",
        imagePath: currentCat?.imagePath || ""
      };

      if (catImage) {
        if (currentCat?.imagePath) {
          await deleteCategory(catEditId, currentCat.imagePath).catch(() => {});
        }
        const uploaded = await uploadCategoryImage(catImage, catEditId || "cat_" + Date.now());
        updateData.imageUrl = uploaded.url;
        updateData.imagePath = uploaded.path;
      }

      if (catEditId) {
        await updateCategory(catEditId, updateData);
        setCatEditId(null);
      } else {
        const docRef = await addCategory(updateData);
        if (catImage) {
          const uploaded = await uploadCategoryImage(catImage, docRef.id);
          await updateCategory(docRef.id, { imageUrl: uploaded.url, imagePath: uploaded.path });
        }
      }
      
      setCatForm({ nameAr: "", nameEn: "", slug: "" });
      setCatImage(null);
      setCatPreview("");
      alert("تم حفظ خصائص الفئة بنجاح ✅");
    } catch (err) { 
      alert("حدث خطأ أثناء حفظ الفئة"); 
    }
    setCatUploading(false);
  };

  const handleCatEdit = (cat) => {
    setCatEditId(cat.id);
    setCatForm({ nameAr: cat.nameAr || "", nameEn: cat.nameEn || "", slug: cat.slug || "" });
    setCatPreview(cat.imageUrl || "");
    setCatImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBanner = (key) => banners.find((b) => b.sectionKey === key);

  const handleUpload = async (sectionKey, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [sectionKey]: true }));
    try {
      const { url, path } = await uploadBannerImage(file);
      const existing = getBanner(sectionKey);
      const data = formData[sectionKey] || {};
      if (existing) {
        if (existing.imagePath) {
          await deleteBanner(existing.id, existing.imagePath).catch(() => {});
        }
        await updateBanner(existing.id, { imageUrl: url, imagePath: path, ...data });
      } else {
        await addBanner({ sectionKey, imageUrl: url, imagePath: path, order: 0, ...data });
      }
      alert("تم رفع الصورة بنجاح ✅");
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
    alert("تم حفظ النص بنجاح ✅");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        
        <h1 style={{ color: "#3D2B1F", marginBottom: "0.5rem", fontWeight: "800" }}>🖼️ لوحة إدارة الفئات وصور ليمو لوكس</h1>
        <p style={{ color: "#8B7355", marginBottom: "2rem" }}>تحكم كامل في هيكلة تصنيفات الشموع الفاخرة وخلفيات الموقع</p>

        {/* ─── 1) لوحة التحكم في الفئات الاحترافية ─── */}
        <div style={{ background: "#fff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 25px rgba(0,0,0,0.04)", marginBottom: "2.5rem", border: "1px solid #E8DDD0" }}>
          <h2 style={{ color: "#3D2B1F", marginTop: 0, borderBottom: "2px solid #FAF7F2", paddingBottom: "12px", fontWeight: "700" }}>🏷️ {catEditId ? "📝 تعديل بيانات وصورة الفئة" : "➕ إضافة فئة مخصصة جديدة"}</h2>
          
          <form onSubmit={handleCatSubmit} style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "20px" }}>
            <div style={{ flex: "1 1 200px" }}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F" }}>الاسم بالعربي *</label>
                <input type="text" value={catForm.nameAr} onChange={(e) => setCatForm({...catForm, nameAr: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F" }}>الاسم بالإنجليزي *</label>
                <input type="text" value={catForm.nameEn} onChange={(e) => setCatForm({...catForm, nameEn: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F" }}>رابط الفئة فرعي (Slug) *</label>
                <input type="text" placeholder="scented" value={catForm.slug} onChange={(e) => setCatForm({...catForm, slug: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", marginTop: "6px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* صندوق الرفع الاحترافي المطور (Drop/Click Zone) */}
            <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "#3D2B1F", marginBottom: "6px" }}>غلاف الفئة الفخم</label>
              <label style={{ flex: 1, minHeight: "140px", background: "#FAF7F2", border: "2px dashed #C9A96E", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden", padding: "10px" }}>
                {catPreview ? (
                  <img src={catPreview} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} alt="" />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "2rem" }}>📸</span>
                    <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#8B7355", fontWeight: "600" }}>اضغط لرفع صورة الغلاف</p>
                  </div>
                )}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) { setCatImage(file); setCatPreview(URL.createObjectURL(file)); }
                }} />
              </label>
              
              <button type="submit" disabled={catUploading} style={{ width: "100%", padding: "14px", backgroundColor: "#3D2B1F", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "12px", boxShadow: "0 4px 12px rgba(61,43,31,0.15)", transition: "all 0.2s" }}>
                {catUploading ? "⏳ جاري الحفظ والرفع..." : catEditId ? "💾 حفظ التعديلات الفخمة" : "✨ إضافة الفئة للمتجر"}
              </button>
            </div>
          </form>

          {/* الجدول */}
          <div style={{ marginTop: "25px", overflowX: "auto" }}>
            <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAF7F2", color: "#8B7355", borderBottom: "1px solid #E8DDD0" }}>
                  <th width="110">غلاف الفئة</th>
                  <th>الاسم بالعربي</th>
                  <th>الاسم بالإنجليزي</th>
                  <th>الرابط (Slug)</th>
                  <th width="120" style={{ textAlign: "center" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid #FAF7F2" }}>
                    <td>
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} width="70" height="45" style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #E8DDD0" }} alt="" />
                      ) : (
                        <span style={{ fontSize: "11px", color: "#8B7355", background: "#FAF7F2", padding: "4px 8px", borderRadius: "6px", border: "1px dashed #E8DDD0" }}>📷 بلا صورة</span>
                      )}
                    </td>
                    <td style={{ fontWeight: "bold", color: "#3D2B1F" }}>{cat.nameAr}</td>
                    <td style={{ color: "#8B7355" }}>{cat.nameEn}</td>
                    <td><code>{cat.slug}</code></td>
                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => handleCatEdit(cat)} style={{ border: "none", background: "none", color: "#C9A96E", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>تعديل وصورة</button>
                      {!cat.isDefault && (
                        <button onClick={async () => { if(confirm("هل تود حذف هذه الفئة نهائياً؟")) await deleteCategory(cat.id, cat.imagePath) }} style={{ border: "none", background: "none", color: "red", cursor: "pointer", fontWeight: "bold", marginRight: "10px" }}>حذف</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── 2) لوحة التحكم في خلفيات وصور الموقع ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ color: "#3D2B1F", margin: "0 0 5px 0", fontWeight: "800" }}>实用 صور وتنسيقات الموقع الخلفية</h2>
          {SECTIONS.map((section) => {
            const banner = getBanner(section.key);
            const isUploading = uploading[section.key];
            return (
              <div key={section.key} style={{ background: "#fff", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 25px rgba(0,0,0,0.04)", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap", border: "1px solid #E8DDD0" }}>
                
                <div style={{ width: "180px", flexShrink: 0 }}>
                  <div style={{ background: "#FAF7F2", border: "2px dashed #E8DDD0", borderRadius: "14px", height: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: "8px" }}>
                    {banner?.imageUrl ? (
                      <img src={banner.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ textAlign: "center", padding: "1rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>📷</div>
                        <p style={{ fontSize: "0.75rem", color: "#8B7355", margin: 0 }}>{section.preview}</p>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#8B7355", textAlign: "center", margin: 0 }}>{section.desc}</p>
                </div>

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
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}
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
                      <button onClick={async () => { if(confirm("حذف؟")) await deleteBanner(banner.id, banner.imagePath) }} style={{ background: "#fff0f0", color: "#cc0000", border: "1px solid #ffcccc", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
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