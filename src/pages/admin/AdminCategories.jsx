import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", slug: "" });
  
  // حالات رفع الصورة
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    } catch (error) {
      console.error("خطأ في جلب الفئات:", error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  // معالجة اختيار الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // رفع الصورة لـ Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lemo_reviews"); 
    const res = await fetch("https://api.cloudinary.com/v1_1/dakjxjp0l/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = existingImageUrl;

      // لو اخترنا صورة جديدة، نرفعها الأول
      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      const categoryData = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        slug: form.slug,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), categoryData);
        alert("✅ تم تحديث الفئة بنجاح!");
      } else {
        if (!finalImageUrl) {
          alert("⚠️ برجاء اختيار صورة للفئة!");
          setLoading(false);
          return;
        }
        await addDoc(collection(db, "categories"), categoryData);
        alert("✅ تم إضافة الفئة الجديدة بنجاح!");
      }

      // تصفير الفورم
      setForm({ nameAr: "", nameEn: "", slug: "" });
      setImageFile(null);
      setPreviewUrl("");
      setExistingImageUrl("");
      setEditingId(null);
      fetchCategories();
      
    } catch (error) {
      alert("❌ حدث خطأ أثناء الحفظ");
    }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setForm({ nameAr: cat.nameAr || "", nameEn: cat.nameEn || "", slug: cat.slug || "" });
    setExistingImageUrl(cat.imageUrl || cat.image || "");
    setPreviewUrl("");
    setImageFile(null);
    setEditingId(cat.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذه الفئة نهائياً؟")) {
      try {
        await deleteDoc(doc(db, "categories", id));
        fetchCategories();
      } catch (error) {
        alert("❌ فشل الحذف");
      }
    }
  };

  const inputStyle = { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #E8DDD0", fontSize: "1rem", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <h2 style={{ color: "#3D2B1F", marginBottom: "2rem", borderBottom: "2px solid #F0E8DF", paddingBottom: "10px" }}>🛠️ لوحة تحكم الفئات والأقسام</h2>
      
      <form onSubmit={handleSubmit} style={{ background: "#FAF8F5", padding: "2rem", borderRadius: "12px", marginBottom: "2.5rem", border: "1px solid #F0E8DF" }}>
        <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>{editingId ? "📝 تعديل بيانات الفئة الحالية" : "✨ إضافة فئة جديدة للمتجر"}</h3>
        
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>اسم الفئة (بالعربي)</label>
        <input name="nameAr" value={form.nameAr} onChange={handleChange} placeholder="مثال: الشموع المعطرة" required style={inputStyle} />
        
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>اسم الفئة (بالإنجليزي)</label>
        <input name="nameEn" value={form.nameEn} onChange={handleChange} placeholder="مثال: Scented Candles" required style={inputStyle} />
        
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>الرابط المختصر (Slug)</label>
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="مثال: scented-candles" required style={{...inputStyle, direction: "ltr", textAlign: "right"}} />
        
        {/* صندوق رفع الصورة */}
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>صورة الفئة</label>
        <div style={{ border: "2px dashed #C9A96E", padding: "2rem", borderRadius: "8px", textAlign: "center", background: "#fff", marginBottom: "15px" }}>
          <label style={{ cursor: "pointer", display: "block" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "10px" }}>📸</span>
            <span style={{ color: "#3D2B1F", fontWeight: "bold", display: "block" }}>اضغط هنا لرفع صورة من جهازك</span>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </label>

          {(previewUrl || existingImageUrl) && (
            <div style={{ marginTop: "15px", display: "inline-block", padding: "5px", background: "#FAF7F2", borderRadius: "8px", border: "1px solid #E8DDD0" }}>
              <img src={previewUrl || existingImageUrl} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px" }} alt="Preview" />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
          <button type="submit" disabled={loading} style={{ background: "#111", color: "#fff", padding: "12px 30px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>{loading ? "جاري الحفظ والرفع..." : "حفظ الفئة"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ nameAr: "", nameEn: "", slug: "" }); setImageFile(null); setPreviewUrl(""); setExistingImageUrl(""); }} style={{ background: "#FAF7F2", color: "#3D2B1F", padding: "12px 24px", borderRadius: "8px", border: "1px solid #E8DDD0", cursor: "pointer", fontWeight: "bold" }}>إلغاء التعديل</button>}
        </div>
      </form>

      <div>
        <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>📦 الفئات المتوفرة بالمتجر حالياً ({categories.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
            <thead>
              <tr style={{ background: "#3D2B1F", color: "#fff" }}>
                <th style={{ padding: "14px", textAlign: "right" }}>الصورة</th>
                <th style={{ padding: "14px", textAlign: "right" }}>الاسم (عربي / EN)</th>
                <th style={{ padding: "14px", textAlign: "right" }}>الرابط المختصر</th>
                <th style={{ padding: "14px", textAlign: "center" }}>التحكم</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#888" }}>لا توجد أي فئات مضافة حتى الآن.</td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid #FAF7F2", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAF8F5"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px" }}>
                      <div style={{ width: "55px", height: "70px", borderRadius: "30px 30px 0 0", overflow: "hidden", border: "1px solid #111", background: "#f9f9f9" }}>
                        <img src={cat.imageUrl || cat.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "600", color: "#3D2B1F" }}>
                      <div>{cat.nameAr}</div>
                      <div style={{ fontSize: "0.85rem", color: "#8B7355", fontWeight: "normal" }}>{cat.nameEn}</div>
                    </td>
                    <td style={{ padding: "12px", color: "#666", fontFamily: "monospace" }}>{cat.slug}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button onClick={() => handleEdit(cat)} style={{ background: "#C9A96E", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", margin: "0 4px", cursor: "pointer", fontWeight: "600" }}>تعديل</button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: "#ff4d4d", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", margin: "0 4px", cursor: "pointer", fontWeight: "600" }}>حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}