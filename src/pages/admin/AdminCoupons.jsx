import React, { useState, useEffect } from "react";
import { addCoupon, getCoupons, deleteCoupon } from "../../firebase/coupons";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const data = await getCoupons();
    setCoupons(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCode || !discount) return;
    setLoading(true);
    await addCoupon(newCode, Number(discount));
    setNewCode("");
    setDiscount("");
    await loadCoupons();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الكوبون؟ ⚠️")) {
      await deleteCoupon(id);
      loadCoupons();
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <h2 style={{ color: "#3D2B1F", marginBottom: "2rem", borderBottom: "2px solid #E8DDD0", paddingBottom: "10px" }}>
        🎟️ إدارة كوبونات الخصم
      </h2>
      
      <form onSubmit={handleAdd} style={{ background: "#fff", padding: "2rem", borderRadius: "15px", border: "1px solid #E8DDD0", marginBottom: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-end", flexWrap: "wrap", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#3D2B1F" }}>كود الخصم (مثال: LEMO20)</label>
          <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #E8DDD0", outline: "none", fontSize: "1rem" }} required placeholder="أدخل الكود هنا" />
        </div>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#3D2B1F" }}>نسبة الخصم (%)</label>
          <input type="number" min="1" max="99" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #E8DDD0", outline: "none", fontSize: "1rem" }} required placeholder="مثال: 15" />
        </div>
        <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "12px 30px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 10px rgba(201,169,110,0.3)" }}>
          {loading ? "جاري الإضافة..." : "إضافة الكوبون ➕"}
        </button>
      </form>

      <div style={{ background: "#fff", borderRadius: "15px", border: "1px solid #E8DDD0", padding: "2rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
        <h3 style={{ marginTop: 0, color: "#3D2B1F", marginBottom: "1.5rem" }}>الكوبونات الفعالة حالياً</h3>
        {coupons.length === 0 ? <p style={{ color: "#777" }}>لا توجد كوبونات مسجلة حتى الآن.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDD0", color: "#8B7355" }}>
                <th style={{ padding: "12px" }}>كود الخصم</th>
                <th style={{ padding: "12px" }}>النسبة</th>
                <th style={{ padding: "12px" }}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #FAF8F5" }}>
                  <td style={{ padding: "12px", fontWeight: "900", color: "#111", letterSpacing: "1px" }}>{c.code}</td>
                  <td style={{ padding: "12px", fontWeight: "700", color: "#4CAF50" }}>{c.discount}%</td>
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(c.id)} style={{ background: "#ffebee", color: "#cc0000", border: "1px solid #ffcdd2", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>حذف 🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}