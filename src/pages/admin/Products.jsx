import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { subscribeToProducts, addProduct, updateProduct, deleteProduct, uploadProductImage } from "../../firebase/products";

const empty = { nameAr: "", nameEn: "", descAr: "", descEn: "", price: "", stock: "", category: "scented", isNew: false, isBestSeller: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProducts(setProducts);
    return unsub;
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.imageUrl || "";
      let imagePath = form.imagePath || "";
      if (imageFile) {
        const uploaded = await uploadProductImage(imageFile, editId || Date.now().toString());
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
      }
      const data = { ...form, price: Number(form.price), stock: Number(form.stock), imageUrl, imagePath };
      if (editId) await updateProduct(editId, data);
      else await addProduct(data);
      setForm(empty); setEditId(null); setImageFile(null); setShowForm(false);
    } catch (err) { alert("حدث خطأ"); }
    setLoading(false);
  };

  const handleEdit = (p) => { setForm(p); setEditId(p.id); setShowForm(true); };
  const handleDelete = async (p) => {
    if (!window.confirm("هل أنت متأكد؟")) return;
    await deleteProduct(p.id, p.imagePath);
  };

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", marginBottom: "10px" };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#3D2B1F" }}>📦 إدارة المنتجات</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); }} style={{
            background: "#C9A96E", color: "#fff", border: "none",
            borderRadius: "10px", padding: "10px 20px", cursor: "pointer", fontWeight: "700"
          }}>+ إضافة منتج</button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>{editId ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>الاسم (عربي)</label><input name="nameAr" value={form.nameAr} onChange={handleChange} required style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>الاسم (إنجليزي)</label><input name="nameEn" value={form.nameEn} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>الوصف (عربي)</label><input name="descAr" value={form.descAr} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>الوصف (إنجليزي)</label><input name="descEn" value={form.descEn} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>السعر (ج.م)</label><input name="price" type="number" value={form.price} onChange={handleChange} required style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>الكمية</label><input name="stock" type="number" value={form.stock} onChange={handleChange} required style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>التصنيف</label>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    <option value="gifts">الهدايا</option>
                    <option value="scented">الشموع المعطرة</option>
                    <option value="decorative">الشموع الديكورية</option>
                    <option value="body">مرطبات الجسم</option>
                  </select>
                </div>
                <div><label style={{ fontSize: "0.9rem", color: "#3D2B1F", fontWeight: "600" }}>صورة المنتج</label><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", gap: "1rem", margin: "10px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} />
                  <span style={{ color: "#3D2B1F", fontWeight: "600" }}>منتج جديد</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange} />
                  <span style={{ color: "#3D2B1F", fontWeight: "600" }}>الأكثر مبيعاً</span>
                </label>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={loading} style={{ background: "#C9A96E", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", cursor: "pointer", fontWeight: "700" }}>
                  {loading ? "جاري الحفظ..." : editId ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(empty); setEditId(null); }} style={{ background: "#E8DDD0", color: "#3D2B1F", border: "none", borderRadius: "10px", padding: "10px 24px", cursor: "pointer" }}>إلغاء</button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          {products.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #E8DDD0" }}>
              <div style={{ width: "50px", height: "50px", background: "#FAF7F2", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} /> : "🕯️"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: "700", color: "#3D2B1F" }}>{p.nameAr}</p>
                <p style={{ margin: 0, color: "#C9A96E", fontSize: "0.9rem" }}>{p.price} ج.م — الكمية: {p.stock}</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {p.isNew && <span style={{ background: "#C9A96E", color: "#fff", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem" }}>جديد</span>}
                {p.isBestSeller && <span style={{ background: "#3D2B1F", color: "#fff", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem" }}>⭐</span>}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(p)} style={{ background: "#FFF8F0", color: "#C9A96E", border: "1px solid #C9A96E", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>تعديل</button>
                <button onClick={() => handleDelete(p)} style={{ background: "#fff0f0", color: "#cc0000", border: "1px solid #ffcccc", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>حذف</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p style={{ textAlign: "center", padding: "2rem", color: "#8B7355" }}>لا توجد منتجات بعد</p>}
        </div>
      </div>
    </div>
  );
}