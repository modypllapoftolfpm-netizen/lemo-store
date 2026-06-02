import React, { useState, useEffect } from "react";
import { addCoupon, getCoupons, deleteCoupon, toggleCouponActive } from "../../firebase/coupons";
import { subscribeToProducts } from "../../firebase/products";
import { subscribeToCategories } from "../../firebase/settings";
import Navbar from "../../components/layout/Navbar";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // المتغيرات المتوافقة مع سيستمك
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("percentage"); 
  const [expiryDate, setExpiryDate] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [scope, setScope] = useState("all"); 
  const [targetIds, setTargetIds] = useState([]);

  useEffect(() => {
    loadCoupons();
    const unsubProducts = subscribeToProducts(setProducts);
    const unsubCategories = subscribeToCategories(setCategories);
    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const loadCoupons = async () => {
    const data = await getCoupons();
    setCoupons(data);
  };

  const handleToggleTarget = (id) => {
    setTargetIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!code || !discount) return;
    
    if (scope !== "all" && targetIds.length === 0) {
      alert("برجاء تحديد قسم واحد أو منتج واحد على الأقل ⚠️");
      return;
    }

    setLoading(true);
    
    const couponData = {
      code,
      discount,
      type,
      minSubtotal,
      expiryDate,
      scope,
      targetIds: scope === "all" ? [] : targetIds,
    };

    try {
      await addCoupon(couponData);
      setCode("");
      setDiscount("");
      setExpiryDate("");
      setMinSubtotal("");
      setScope("all");
      setTargetIds([]);
      await loadCoupons();
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الكوبون!");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الكوبون نهائياً؟ ⚠️")) {
      await deleteCoupon(id);
      loadCoupons();
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await toggleCouponActive(id, currentStatus);
    loadCoupons();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]" dir="rtl">
      <Navbar />
      
      {/* 📱 أكواد التجاوب مع الموبايل (Responsive CSS) */}
      <style>{`
        .admin-container { padding: 2rem; max-width: 1000px; margin: 0 auto; font-family: 'Cairo', sans-serif; }
        .form-card { background: #fff; padding: 2.5rem; border-radius: 20px; border: 1px solid #E8DDD0; margin-bottom: 2.5rem; box-shadow: 0 4px 15px rgba(61,43,31,0.04); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .table-card { background: #fff; border-radius: 20px; border: 1px solid #E8DDD0; padding: 2.5rem; box-shadow: 0 4px 15px rgba(61,43,31,0.04); overflow-x: auto; }
        
        @media (max-width: 768px) {
          .admin-container { padding: 1rem; }
          .form-card { padding: 1.5rem; }
          .form-grid { grid-template-columns: 1fr; gap: 1rem; }
          .table-card { padding: 1rem; border-radius: 12px; }
          .mobile-hide { display: none; }
          td, th { font-size: 0.85rem; padding: 10px !important; }
        }
      `}</style>

      <div className="admin-container">
        <form onSubmit={handleAdd} className="form-card">
          
          <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem", borderBottom: "2px solid #FAF7F2", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "900" }}>
            <span>✂️</span> إدارة نظام الكوبونات المتطور
          </h2>

          <div className="form-grid" style={{ marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "900", color: "#8B7355", fontSize: "0.85rem" }}>كود الكوبون</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #FAF7F2", outline: "none", fontSize: "1rem", background: "#FAF8F5", fontWeight: "bold", boxSizing: "border-box" }} required placeholder="مثال: LEMO2026" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "900", color: "#8B7355", fontSize: "0.85rem" }}>قيمة الخصم</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100px", padding: "14px", borderRadius: "12px", border: "2px solid #FAF7F2", outline: "none", fontSize: "1rem", background: "#FAF8F5", fontWeight: "bold" }}>
                  <option value="percentage">% نسبة</option>
                  <option value="fixed">ج.م مبلغ</option>
                </select>
                <input type="number" min="1" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "2px solid #FAF7F2", outline: "none", fontSize: "1rem", background: "#FAF8F5", fontWeight: "bold", boxSizing: "border-box" }} required placeholder="القيمة" />
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "900", color: "#8B7355", fontSize: "0.85rem" }}>تاريخ الانتهاء (اختياري)</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #FAF7F2", outline: "none", fontSize: "1rem", background: "#FAF8F5", fontWeight: "bold", color: "#3D2B1F", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "900", color: "#8B7355", fontSize: "0.85rem" }}>الحد الأدنى للطلب (ج.م) - اختياري</label>
              <input type="number" min="0" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #FAF7F2", outline: "none", fontSize: "1rem", background: "#FAF8F5", fontWeight: "bold", boxSizing: "border-box" }} placeholder="0" />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "900", color: "#8B7355", fontSize: "0.85rem" }}>نطاق الكوبون</label>
            <select value={scope} onChange={(e) => { setScope(e.target.value); setTargetIds([]); }} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #FAF7F2", outline: "none", fontSize: "1rem", background: "#FAF8F5", fontWeight: "bold", boxSizing: "border-box" }}>
              <option value="all">على جميع المنتجات</option>
              <option value="category">تحديد أقسام معينة</option>
              <option value="product">تحديد منتجات معينة</option>
            </select>
          </div>

          {scope !== "all" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "900", color: "#E67E22", fontSize: "0.85rem" }}>
                {scope === "category" ? "حدد الأقسام المستهدفة (يمكن التحديد المتعدد)" : "حدد المنتجات المستهدفة (يمكن التحديد المتعدد)"}
              </label>
              <div style={{ maxHeight: "160px", overflowY: "auto", border: "2px solid #fdebd0", borderRadius: "12px", padding: "12px", background: "#fdf2e9" }}>
                {scope === "category" ? (
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

          <div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#3D2B1F", color: "#fff", padding: "16px", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "900", fontSize: "1.1rem", transition: "all 0.3s" }}>
              {loading ? "جاري الإضافة للنظام..." : "إضافة الكوبون للنظام"}
            </button>
          </div>
        </form>

        <div className="table-card">
          <h3 style={{ marginTop: 0, color: "#3D2B1F", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "900" }}>📦 الكوبونات الفعالة</h3>
          {coupons.length === 0 ? <p style={{ color: "#8B7355", textAlign: "center", padding: "2rem", fontWeight: "bold" }}>لا يوجد كوبونات حالياً.</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", whiteSpace: "nowrap", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8DDD0", color: "#8B7355", fontSize: "0.9rem" }}>
                  <th style={{ padding: "16px" }}>الكود</th>
                  <th style={{ padding: "16px" }}>الخصم</th>
                  <th style={{ padding: "16px" }}>مطبق على</th>
                  <th style={{ padding: "16px" }} className="mobile-hide">الحد الأدنى</th>
                  <th style={{ padding: "16px" }} className="mobile-hide">الانتهاء</th>
                  <th style={{ padding: "16px", textAlign: "center" }}>الحالة / إجراء</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  let targetNames = "-";
                  if (c.scope === "category" && c.targetIds?.length) {
                    targetNames = c.targetIds.map(id => categories.find(cat => (cat.slug || cat.id) === id)?.nameAr || "غير معروف").join("، ");
                  } else if (c.scope === "product" && c.targetIds?.length) {
                    targetNames = c.targetIds.map(id => products.find(p => p.id === id)?.nameAr || "غير معروف").join("، ");
                  }

                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #FAF8F5" }} className="hover:bg-[#FAF8F5]">
                      <td style={{ padding: "16px", fontWeight: "900", color: "#111" }}>{c.code}</td>
                      <td style={{ padding: "16px", fontWeight: "900", color: "#4CAF50" }}>
                        {c.discount} {c.type === "percentage" ? "%" : "ج.م"}
                      </td>
                      <td style={{ padding: "16px", fontWeight: "bold", color: "#8B7355", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.scope === "all" ? "جميع المنتجات" : targetNames}
                      </td>
                      <td style={{ padding: "16px", fontWeight: "bold" }} className="mobile-hide">{c.minSubtotal ? `${c.minSubtotal} ج.م` : "-"}</td>
                      <td style={{ padding: "16px", color: c.expiryDate && new Date(c.expiryDate) < new Date() ? "red" : "#111", fontWeight: "bold" }} className="mobile-hide">
                        {c.expiryDate || "مدى الحياة"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => handleToggleStatus(c.id, c.active)} style={{ background: c.active ? "#E8F5E9" : "#FFF3E0", color: c.active ? "#2E7D32" : "#E65100", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                          {c.active ? "مفعل ✔️" : "موقوف ⏸️"}
                        </button>
                        <button onClick={() => handleDelete(c.id)} style={{ background: "#ffebee", color: "#cc0000", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>حذف 🗑️</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}