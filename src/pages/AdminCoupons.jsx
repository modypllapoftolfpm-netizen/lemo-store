import { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/layout/Navbar";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // percentage أو fixed
  const [minSubtotal, setMinSubtotal] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [type, setType] = useState("global"); // global, product, category
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("code", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async () => {
    if (!newCode || !newDiscount) return alert("الرجاء إدخال الكود وقيمة الخصم");
    
    await addDoc(collection(db, "coupons"), {
      code: newCode.toUpperCase().trim(),
      discount: Number(newDiscount),
      type: discountType, // النوع الجديد (نسبة أو مبلغ ثابت)
      couponScope: type, // النطاق (عام، منتج، فئة)
      targetId: targetId,
      minSubtotal: Number(minSubtotal),
      expiryDate: expiryDate,
      active: true,
      createdAt: new Date()
    });
    
    // تصفير الحقول بعد الإضافة
    setNewCode(""); setNewDiscount(""); setMinSubtotal(0); setExpiryDate(""); setTargetId("");
    alert("✅ تم إضافة الكوبون المتطور بنجاح!");
  };

  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: "3rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "2rem auto", background: "#fff", padding: "2.5rem", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <h2 style={{ color: "#3D2B1F", borderBottom: "2px solid #FAF7F2", paddingBottom: "1rem", marginBottom: "2rem" }}>🛠️ إدارة نظام الكوبونات المتطور</h2>
        
        <div style={{ background: "#fdfbf8", padding: "2rem", borderRadius: "15px", marginBottom: "2rem", border: "1px solid #f0e8df" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label>كود الكوبون</label>
              <input placeholder="مثال: LEMO2026" value={newCode} onChange={(e) => setNewCode(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label>قيمة الخصم</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input type="number" placeholder="القيمة" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={inputStyle}>
                  <option value="percentage">% نسبة</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label>الحد الأدنى للطلب (ج.م)</label>
              <input type="number" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label>تاريخ الانتهاء</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label>نطاق الكوبون</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                  <option value="global">على المتجر بالكامل</option>
                  <option value="product">على منتج معين</option>
                  <option value="category">على قسم معين</option>
              </select>
            </div>

            {(type === "product" || type === "category") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label>معرف الـ ID (للمنتج/القسم)</label>
                <input placeholder="انسخ الـ ID هنا" value={targetId} onChange={(e) => setTargetId(e.target.value)} style={inputStyle} />
              </div>
            )}
          </div>

          <button onClick={handleAdd} style={{ marginTop: "2rem", width: "100%", padding: "15px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>
            إضافة الكوبون للنظام
          </button>
        </div>

        <h3>📦 الكوبونات الفعالة:</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
          {coupons.map(c => (
            <div key={c.id} style={{ background: "#fff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ background: "#3D2B1F", color: "#fff", padding: "4px 10px", borderRadius: "5px", marginLeft: "10px", fontWeight: "bold" }}>{c.code}</span>
                <span style={{ color: "#666" }}>
                  الخصم: <strong>{c.discount}{c.type === "percentage" ? "%" : " ج.م"}</strong> | 
                  الحد الأدنى: <strong>{c.minSubtotal || 0} ج.م</strong>
                </span>
                {c.expiryDate && <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "5px" }}>ينتهي في: {c.expiryDate}</div>}
              </div>
              <button onClick={() => deleteDoc(doc(db, "coupons", c.id))} style={{ background: "#FFE5E5", color: "#D32F2F", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>حذف</button>
            </div>
          ))}
          {coupons.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>لا يوجد كوبونات حالياً.</p>}
        </div>
      </div>
    </div>
  );
}