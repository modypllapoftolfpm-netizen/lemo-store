import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { getSettings, updateSettings } from "../../firebase/settings";

export default function AdminSettings() {
  const [form, setForm] = useState({ storeName: "", email: "", phone: "", whatsapp: "", address: "", freeShippingMin: 0 });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => { if (s) setForm((prev) => ({ ...prev, ...s })); });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateSettings(form);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", marginBottom: "1rem" };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>⚙️ إعدادات المتجر</h1>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <form onSubmit={handleSave}>
            {[
              { name: "storeName", label: "اسم المتجر" },
              { name: "email", label: "البريد الإلكتروني" },
              { name: "phone", label: "رقم الهاتف" },
              { name: "whatsapp", label: "واتساب" },
              { name: "address", label: "العنوان" },
              { name: "freeShippingMin", label: "حد الشحن المجاني (ج.م)" },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{field.label}</label>
                <input name={field.name} value={form[field.name] || ""} onChange={handleChange} style={inputStyle} />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              width: "100%", background: saved ? "#4CAF50" : "#C9A96E",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "14px", fontSize: "1rem", fontWeight: "700", cursor: "pointer"
            }}>
              {saved ? "✅ تم الحفظ!" : loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}