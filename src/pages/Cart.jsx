import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import Navbar from "../components/layout/Navbar";
import { validateCoupon } from "../firebase/coupons"; 

export default function Cart() {
  const { items, removeFromCart, updateQty } = useCart();
  const { field, lang } = useLang();
  const navigate = useNavigate();

  const [promo, setPromo] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const giftFee = 50;

  // 1. حساب المجموع الكلي (Subtotal)
  const subtotal = items.reduce((acc, i) => acc + (parseFloat(i.price || 0) * i.qty), 0);

  const handleApply = async () => {
    // بنبعت الكود ومجموع السلة الحالي للدالة الذكية عشان تفحص الشروط
    const result = await validateCoupon(promo, subtotal);
    console.log("نتيجة فحص الكوبون المطور:", result);
    
    if (result.valid) { 
      setCoupon(result.data); // بنخزن بيانات الكوبون كاملة (المستند)
      setPromoMsg(result.msg); 
    } else { 
      setCoupon(null); 
      setPromoMsg(result.msg); // بنعرض رسالة الخطأ المحددة
    }
  };

  // 2. حساب قيمة الخصم الذكي بناءً على نوع الكوبون الجديد
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === "percentage" || coupon.type === "global") {
      const discountVal = parseFloat(coupon.discount || 0);
      discountAmount = (subtotal * discountVal) / 100;
    } else if (coupon.type === "fixed") {
      discountAmount = parseFloat(coupon.discount || 0);
    }
  }
  
  // 3. حساب الإجمالي النهائي
  const finalTotal = Math.max(0, subtotal - discountAmount + (isGift ? giftFee : 0));

  const proceedToCheckout = () => {
    navigate("/checkout", { 
      state: { 
        total: finalTotal, 
        subtotal: subtotal,
        isGift, 
        giftNote, 
        discount: discountAmount, 
        couponCode: coupon ? coupon.code : null,
        items: items 
      } 
    });
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }}>
      <Navbar />
      
      {/* 📱 أكواد الـ CSS لتجاوب صفحة السلة مع الموبايل */}
      <style>{`
        .cart-wrapper { max-width: 1200px; margin: 3rem auto; padding: 0 2rem; }
        .cart-layout { display: grid; grid-template-columns: 1fr 400px; gap: 3rem; align-items: start; }
        .cart-items-section { background: #fff; padding: 2rem; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .cart-summary-section { background: #3D2B1F; color: #fff; padding: 2.5rem; border-radius: 24px; position: sticky; top: 20px; }
        
        .cart-item { display: flex; align-items: center; gap: 1.5rem; border-bottom: 1px solid #f0e8df; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .cart-item:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .item-img-box { width: 100px; height: 100px; border-radius: 12px; overflow: hidden; background: #f9f9f9; flex-shrink: 0; }
        .item-info { flex: 1; min-width: 0; }
        .item-name { margin: 0 0 0.5rem 0; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .item-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        /* شاشات الموبايل والتابلت الصغير */
        @media (max-width: 992px) {
          .cart-layout { grid-template-columns: 1fr; gap: 2rem; }
          .cart-summary-section { position: static; }
        }

        /* شاشات الموبايل بالطول */
        @media (max-width: 576px) {
          .cart-wrapper { padding: 0 1rem; margin: 1.5rem auto; }
          .cart-items-section { padding: 1.5rem 1rem; }
          .cart-summary-section { padding: 1.5rem; }
          .cart-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .item-img-box { width: 80px; height: 80px; }
          .item-actions { width: 100%; justify-content: space-between; margin-top: 5px; }
        }
      `}</style>

      <div className="cart-wrapper">
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem", fontWeight: "900" }}>{lang === "ar" ? "حقيبة التسوق" : "Shopping Bag"}</h1>

        <div className="cart-layout">
          
          {/* قسم المنتجات */}
          <div className="cart-items-section">
            {items.length === 0 ? <p style={{ textAlign: "center", color: "#888", fontWeight: "bold" }}>السلة فارغة</p> : items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-img-box">
                  <img src={Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.src = 'https://via.placeholder.com/100'} alt={item.name} />
                </div>
                <div className="item-info">
                  <h3 className="item-name">{field(item, "name")}</h3>
                  <p style={{ color: "#C9A96E", fontWeight: "900", fontSize: "1.1rem", margin: 0 }}>{item.price} ج.م</p>
                </div>
                <div className="item-actions">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FAF8F5", borderRadius: "8px", padding: "4px" }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "#fff", border: "1px solid #E8DDD0", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>-</button>
                    <span style={{ fontWeight: "bold", width: "20px", textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: "#fff", border: "1px solid #E8DDD0", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "#FFE5E5", color: "#D32F2F", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>حذف</button>
                </div>
              </div>
            ))}
          </div>

          {/* ملخص الطلب */}
          <div className="cart-summary-section">
            <h2 style={{ fontSize: "1.4rem", marginBottom: "2rem", fontWeight: "900" }}>{lang === "ar" ? "ملخص الطلب" : "Order Summary"}</h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  value={promo} 
                  onChange={(e) => setPromo(e.target.value.toUpperCase())} 
                  placeholder="كود الخصم" 
                  style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "none", color: "#333", background: "#fff", outline: "none", fontWeight: "bold" }} 
                />
                <button onClick={handleApply} style={{ background: "#C9A96E", color: "#fff", border: "none", padding: "0 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>تطبيق</button>
              </div>
              <p style={{ fontSize: "0.85rem", marginTop: "8px", fontWeight: "bold", color: promoMsg.includes("✅") ? "#81c784" : "#ff8a80" }}>{promoMsg}</p>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem", cursor: "pointer", background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "10px" }}>
              <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#C9A96E" }} />
              <span style={{ fontWeight: "bold" }}>تغليف هدايا فخم (+{giftFee} ج.م)</span>
            </label>
            
            {/* 🛠️ التعديل تم هنا: إضافة الألوان لخانة رسالة الإهداء */}
            {isGift && <textarea placeholder="اكتب رسالة الإهداء..." value={giftNote} onChange={(e) => setGiftNote(e.target.value)} style={{ width: "100%", marginBottom: "1.5rem", padding: "14px", borderRadius: "10px", border: "none", boxSizing: "border-box", fontFamily: "Cairo", outline: "none", resize: "none", height: "80px", color: "#3D2B1F", backgroundColor: "#FFFFFF" }} />}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", fontWeight: "bold", color: "#ccc" }}>
                <span>{lang === "ar" ? "المجموع:" : "Subtotal:"}</span>
                <span>{subtotal.toFixed(2)} ج.م</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", color: "#81c784", fontWeight: "bold" }}>
                <span>{lang === "ar" ? "الخصم:" : "Discount:"}</span>
                <span>-{discountAmount.toFixed(2)} ج.م</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", fontSize: "1.4rem", fontWeight: "900", color: "#fff" }}>
                <span>الإجمالي:</span>
                <span style={{ color: "#C9A96E" }}>{finalTotal.toFixed(2)} ج.م</span>
              </div>
            </div>

            <button onClick={proceedToCheckout} disabled={items.length === 0} style={{ width: "100%", background: items.length === 0 ? "#555" : "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", padding: "18px", borderRadius: "12px", fontWeight: "900", cursor: items.length === 0 ? "not-allowed" : "pointer", fontSize: "1.1rem", transition: "all 0.3s" }}>
              إتمام الطلب ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}