import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { subscribeToBanners, addBanner, deleteBanner, uploadBannerImage } from "../../firebase/settings";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ titleAr: "", titleEn: "", subtitleAr: "", subtitleEn: "", order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBanners(setBanners);
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("اختر صورة");
    setLoading(true);
    try {
      const { url, path } = await uploadBannerImage(imageFile);
      await addBanner({ ...form, imageUrl: url, imagePath: path, order: Number(form.order) });
      setForm({ titleAr: "", titleEn: "", subtitleAr: "", subtitleEn: "", order: 0 });
      setImageFile(null);
    } catch { alert("حدث خطأ"); }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", marginBottom: "10px" };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>🖼️ إدارة البانرات</h1>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>إضافة بانر جديد</h2>
          <form onSubmit={handleSubmit}>
            <input name="titleAr" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} placeholder="العنوان (عربي)" style={inputStyle} />
            <input name="titleEn" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Title (English)" style={inputStyle} />
            <input name="subtitleAr" value={form.subtitleAr} onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })} placeholder="العنوان الفرعي (عربي)" style={inputStyle} />
            <input name="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="الترتيب" style={inputStyle} />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={inputStyle} />
            <button type="submit" disabled={loading} style={{ background: "#C9A96E", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", cursor: "pointer", fontWeight: "700" }}>
              {loading ? "جاري الرفع..." : "إضافة البانر"}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {banners.map((b) => (
            <div key={b.id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
              <img src={b.imageUrl} alt="" style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "10px" }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#3D2B1F" }}>{b.titleAr}</p>
                <p style={{ margin: 0, color: "#8B7355", fontSize: "0.9rem" }}>ترتيب: {b.order}</p>
              </div>
              <button onClick={() => deleteBanner(b.id, b.imagePath)} style={{ background: "#fff0f0", color: "#cc0000", border: "1px solid #ffcccc", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>حذف</button>
            </div>
          ))}
          {banners.length === 0 && <p style={{ textAlign: "center", color: "#8B7355" }}>لا توجد بانرات بعد</p>}
        </div>
      </div>
    </div>
  );
}