import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
// ربط السلة بملف الكوبونات الجديد اللي برمجناه
import { validateCoupon } from "../firebase/coupons";

export default function Cart() {
  const { items, removeFromCart, updateQty, getTotal, clearCart } = useCart();
  const { t, field } = useLang();
  const navigate = useNavigate();
  
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  
  // دالة getTotal بتستقبل نسبة الخصم وبترجع الإجمالي قبل وبعد
  const { subtotal, total } = getTotal(discount);

  // دالة تفعيل الكوبون الجديدة
  const handlePromo = async () => {
    if (!promo.trim()) {
      setPromoMsg("⚠️ الرجاء إدخال كود الخصم أولاً");
      return;
    }

    const discountPercent = await validateCoupon(promo);
    
    if (discountPercent) {
      setDiscount(discountPercent);
      setPromoMsg(`✅ تم تطبيق خصم ${discountPercent}% بنجاح!`);
    } else {
      setDiscount(0);
      setPromoMsg("❌ كود الخصم غير صحيح أو منتهي الصلاحية.");
    }
  };

  if (items.length === 0) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🛒</div>
        <h2 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>{t.cart.empty}</h2>
        <Link to="/products" style={{
          background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff",
          padding: "12px 35px", borderRadius: "25px",
          textDecoration: "none", fontWeight: "700", boxShadow: "0 4px 15px rgba(201,169,110,0.3)"
        }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem", fontWeight: "800" }}>🛒 {t.cart.title}</h1>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* المنتجات */}
          <div style={{ flex: 2, minWidth: "300px" }}>
            {items.map((item) => (
              <div key={item.id} style={{
                background: "#fff", borderRadius: "16px",
                padding: "1.2rem", marginBottom: "1.2rem",
                display: "flex", gap: "1.2rem", alignItems: "center",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0"
              }}>
                <div style={{
                  width: "85px", height: "85px", background: "#FAF7F2",
                  borderRadius: "12px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "2rem", flexShrink: 0
                }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                    : "🕯️"}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px", color: "#3D2B1F", fontSize: "1.05rem", fontWeight: "700" }}>
                    {field(item, "name")}
                  </h3>
                  <p style={{ color: "#C9A96E", fontWeight: "800", margin: "0 0 10px", fontSize: "1.1rem" }}>
                    {item.price} {t.currency}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      border: "1px solid #E8DDD0", background: "#FAF7F2",
                      cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold", color: "#3D2B1F"
                    }}>-</button>
                    <span style={{ fontWeight: "800", color: "#3D2B1F", minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      border: "1px solid #E8DDD0", background: "#FAF7F2",
                      cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold", color: "#3D2B1F"
                    }}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{
                  background: "#ffebee", border: "1px solid #ffcdd2", cursor: "pointer",
                  color: "#cc0000", fontSize: "1.2rem", padding: "10px", borderRadius: "10px", transition: "0.2s"
                }}>🗑️</button>
              </div>
            ))}
          </div>

          {/* ملخص الطلب */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #E8DDD0",
              padding: "1.8rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", position: "sticky", top: "100px"
            }}>
              <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontWeight: "800", fontSize: "1.2rem" }}>ملخص الطلب</h3>

              {/* قسم الكوبون */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  placeholder="أدخل كود الخصم (مثال: LEMO20)"
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: "8px",
                    border: "2px solid #E8DDD0", outline: "none", fontSize: "0.95rem", fontWeight: "600", fontFamily: "Cairo"
                  }}
                />
                <button onClick={handlePromo} style={{
                  background: "#111", color: "#fff", border: "none", fontWeight: "700",
                  borderRadius: "8px", padding: "10px 16px", cursor: "pointer", transition: "0.2s"
                }}>تطبيق</button>
              </div>
              
              {promoMsg && (
                <div style={{ 
                  padding: "10px", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "700",
                  background: discount > 0 ? "#e8f5e9" : "#ffebee", 
                  color: discount > 0 ? "#2e7d32" : "#c62828",
                  border: `1px solid ${discount > 0 ? "#c8e6c9" : "#ffcdd2"}`
                }}>
                  {promoMsg}
                </div>
              )}

              {/* الحسابات */}
              <div style={{ borderTop: "2px dashed #E8DDD0", paddingTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "1.05rem" }}>
                  <span style={{ color: "#8B7355", fontWeight: "600" }}>{t.cart.subtotal}</span>
                  <span style={{ fontWeight: "700", color: "#3D2B1F" }}>{subtotal} {t.currency}</span>
                </div>
                
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#2e7d32", fontSize: "1.05rem", fontWeight: "700" }}>
                    <span>قيمة الخصم ({discount}%)</span>
                    <span>- {subtotal - total} {t.currency}</span>
                  </div>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "900", fontSize: "1.3rem", borderTop: "2px solid #E8DDD0", paddingTop: "1rem", marginTop: "0.5rem" }}>
                  <span style={{ color: "#111" }}>الإجمالي</span>
                  <span style={{ color: "#C9A96E" }}>{total} {t.currency}</span>
                </div>
              </div>

              <button onClick={() => navigate("/checkout", { state: { discount, total } })} style={{
                width: "100%", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff",
                border: "none", borderRadius: "10px", padding: "16px",
                fontSize: "1.1rem", fontWeight: "800", cursor: "pointer", marginTop: "1.5rem", boxShadow: "0 4px 15px rgba(201,169,110,0.3)"
              }}>إتمام الطلب ➔</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}