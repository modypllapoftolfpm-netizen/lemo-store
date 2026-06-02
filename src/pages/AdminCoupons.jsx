import { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/layout/Navbar";
import { subscribeToProducts } from "../firebase/products";
import { subscribeToCategories } from "../firebase/settings";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); 
  const [minSubtotal, setMinSubtotal] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [type, setType] = useState("global"); 
  const [targetIds, setTargetIds] = useState([]); // 🔴 اتغيرت لـ Array عشان تقبل أكتر من منتج

  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("code", "asc"));
    const unsubCoupons = onSnapshot(q, (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubProducts = subscribeToProducts(setProducts);
    const unsubCategories = subscribeToCategories(setCategories);

    return () => {
      unsubCoupons();
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const handleToggleTarget = (id) => {
    setTargetIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (!newCode || !newDiscount) return alert("الرجاء إدخال الكود وقيمة الخصم");
    if (type !== "global" && targetIds.length === 0) return alert("الرجاء تحديد منتج أو قسم واحد على الأقل");
    
    await addDoc(collection(db, "coupons"), {
      code: newCode.toUpperCase().trim(),
      discount: Number(newDiscount),
      type: discountType, 
      couponScope: type, 
      targetIds: type === "global" ? [] : targetIds, // 🔴 بنحفظ مصفوفة الـ IDs هنا
      minSubtotal: Number(minSubtotal),
      expiryDate: expiryDate,
      active: true,
      createdAt: new Date()
    });
    
    setNewCode(""); setNewDiscount(""); setMinSubtotal(0); setExpiryDate(""); setTargetIds([]);
    alert("✅ تم إضافة الكوبون المتطور بنجاح!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: "3rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      
      {/* 📱 أكواد التجاوب مع الموبايل */}
      <style>{`
        .admin-box { max-width: 900px; margin: 2rem auto; background: #fff; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .coupon-card { background: #fff; padding: 1.2rem; border-radius: 12px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .coupon-info { display: flex; flex-direction: column; gap: 5px; }
        .coupon-badge { background: #3D2B1F; color: #fff; padding: 4px 10px; border-radius: 5px; font-weight: bold; width: fit-content; }
        
        @media (max-width: 768px) {
          .admin-box { margin: 1rem; padding: 1.5rem; }
          .form-grid { grid-template-columns: 1fr; }
          .coupon-card { flex-direction: column; align-items: flex-start; gap: 15px; }
          .del-btn { width: 100%; }
        }
      `}</style>

      <div className="admin-box">
        <h2 style={{ color: "#3D2B1F", borderBottom: "2px solid #FAF7F2", paddingBottom: "1rem", marginBottom: "2rem" }}>🛠️ إدارة نظام الكوبونات المتطور</h2>
        
        <div style={{ background: "#fdfbf8", padding: "2rem", borderRadius: "15px", marginBottom: "2rem", border: "1px solid #f0e8df" }}>
          <div className="form-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#8B7355" }}>كود الكوبون</label>
              <input placeholder="مثال: LEMO2026" value={newCode} onChange={(e) => setNewCode(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#8B7355" }}>قيمة الخصم</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input type="number" placeholder="القيمة" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem", flex: 1 }} />
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }}>
                  <option value="percentage">% نسبة</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#8B7355" }}>الحد الأدنى للطلب (ج.م)</label>
              <input type="number" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#8B7355" }}>تاريخ الانتهاء</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px", gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#8B7355" }}>نطاق الكوبون</label>
              <select value={type} onChange={(e) => { setType(e.target.value); setTargetIds([]); }} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem", fontWeight: "bold" }}>
                  <option value="global">على المتجر بالكامل</option>
                  <option value="category">على أقسام معينة</option>
                  <option value="product">على منتجات معينة</option>
              </select>
            </div>

            {/* 🔴 المربعات الذكية بدلاً من نسخ الـ ID */}
            {type !== "global" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "1 / -1" }}>
                <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#E67E22" }}>
                  {type === "category" ? "حدد الأقسام المستهدفة (يمكن اختيار أكثر من قسم)" : "حدد المنتجات المستهدفة (يمكن اختيار أكثر من منتج)"}
                </label>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: "2px solid #fdebd0", borderRadius: "8px", padding: "12px", background: "#fdf2e9" }}>
                  {type === "category" ? (
                    categories.length > 0 ? categories.map(cat => (
                      <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold", color: "#3D2B1F" }}>
                        <input type="checkbox" checked={targetIds.includes(cat.slug || cat.id)} onChange={() => handleToggleTarget(cat.slug || cat.id)} style={{ width: "18px", height: "18px", accentColor: "#E67E22" }} />
                        {cat.nameAr}
                      </label>
                    )) : <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>لا توجد أقسام مسجلة.</p>
                  ) : (
                    products.length > 0 ? products.map(p => (
                      <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold", color: "#3D2B1F" }}>
                        <input type="checkbox" checked={targetIds.includes(p.id)} onChange={() => handleToggleTarget(p.id)} style={{ width: "18px", height: "18px", accentColor: "#E67E22" }} />
                        {p.nameAr}
                      </label>
                    )) : <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>لا توجد منتجات مسجلة.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleAdd} style={{ marginTop: "2rem", width: "100%", padding: "15px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>
            إضافة الكوبون للنظام
          </button>
        </div>

        <h3 style={{ color: "#3D2B1F" }}>📦 الكوبونات الفعالة:</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
          {coupons.map(c => {
            // معالجة أسماء المنتجات/الأقسام المحددة لعرضها
            let targetsStr = "المتجر بالكامل";
            if (c.couponScope === "category" && c.targetIds?.length) {
              targetsStr = c.targetIds.map(id => categories.find(cat => (cat.slug || cat.id) === id)?.nameAr || "قسم").join("، ");
            } else if (c.couponScope === "product" && c.targetIds?.length) {
              targetsStr = c.targetIds.map(id => products.find(p => p.id === id)?.nameAr || "منتج").join("، ");
            }

            return (
              <div key={c.id} className="coupon-card">
                <div className="coupon-info">
                  <div className="coupon-badge">{c.code}</div>
                  <span style={{ color: "#666", fontSize: "0.9rem" }}>
                    الخصم: <strong style={{ color: "#4CAF50" }}>{c.discount}{c.type === "percentage" ? "%" : " ج.م"}</strong> | 
                    الحد الأدنى: <strong>{c.minSubtotal || 0} ج.م</strong>
                  </span>
                  <span style={{ color: "#8B7355", fontSize: "0.85rem", fontWeight: "bold" }}>
                    مطبق على: {targetsStr}
                  </span>
                  {c.expiryDate && <div style={{ fontSize: "0.8rem", color: "red", marginTop: "2px", fontWeight: "bold" }}>ينتهي في: {c.expiryDate}</div>}
                </div>
                <button className="del-btn" onClick={() => deleteDoc(doc(db, "coupons", c.id))} style={{ background: "#FFE5E5", color: "#D32F2F", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>حذف 🗑️</button>
              </div>
            )
          })}
          {coupons.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>لا يوجد كوبونات حالياً.</p>}
        </div>
      </div>
    </div>
  );
}