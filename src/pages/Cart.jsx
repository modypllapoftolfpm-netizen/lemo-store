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

  const handleApply = async () => {
    const data = await validateCoupon(promo);
    if (data) { 
      setCoupon(data); 
      setPromoMsg("✅ تم تطبيق الكوبون!"); 
    }
    else { 
      setCoupon(null); 
      setPromoMsg("❌ كوبون غير صالح"); 
    }
  };

  // ─── الحسابات (مع فرض قيم أمان قوية لمنع NaN) ────────────────────
  // بنحسب المجموع، ونضمن إن السعر والكمية أرقام، لو فيهم حاجة ناقصة بنحط 0
  const subtotal = items.reduce((acc, i) => {
    const price = parseFloat(i.price || 0);
    const qty = parseInt(i.qty || 0);
    return acc + (price * qty);
  }, 0);
  
  // بنجيب الخصم كـ رقم، ولو مش موجود بنعتبره 0
  const discountVal = (coupon && coupon.discount) ? parseFloat(coupon.discount) : 0;
  const discountAmount = (subtotal * discountVal) / 100;
  
  // الإجمالي: بنستخدم Math.max(0, ...) عشان نضمن إن الرقم عمره ما يطلع بالسالب أو NaN
  const finalTotal = Math.max(0, subtotal - discountAmount + (isGift ? giftFee : 0));

  const proceedToCheckout = () => {
    navigate("/checkout", { 
      state: { 
        total: finalTotal, 
        isGift, 
        giftNote, 
        discount: discountVal,
        items: items 
      } 
    });
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }}>
      <Navbar />
      
      <div style={{ maxWidth: "1200px", margin: "3rem auto", padding: "0 2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>{lang === "ar" ? "حقيبة التسوق" : "Shopping Bag"}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "3rem" }}>
          
          {/* جزء المنتجات */}
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            {items.length === 0 ? <p>السلة فارغة</p> : items.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderBottom: "1px solid #f0e8df", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "12px", overflow: "hidden", background: "#f9f9f9" }}>
                  <img src={item.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.src = 'https://via.placeholder.com/100'} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{field(item, "name")}</h3>
                  <p style={{ color: "#C9A96E", fontWeight: "bold", fontSize: "1.1rem" }}>{item.price} ج.م</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "#f0f0f0", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer" }}>-</button>
                  <span style={{ fontWeight: "bold" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: "#f0f0f0", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer" }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "transparent", border: "none", color: "#ff4d4d", cursor: "pointer", marginRight: "10px" }}>حذف</button>
                </div>
              </div>
            ))}
          </div>

          {/* جزء ملخص الطلب */}
          <div style={{ background: "#3D2B1F", color: "#fff", padding: "2.5rem", borderRadius: "20px", height: "fit-content" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "2rem" }}>{lang === "ar" ? "ملخص الطلب" : "Order Summary"}</h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  value={promo} 
                  onChange={(e) => setPromo(e.target.value.toUpperCase())} 
                  placeholder="كود الخصم" 
                  style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "1px solid #ccc", color: "#333", background: "#fff" }} 
                />
                <button onClick={handleApply} style={{ background: "#C9A96E", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}>تطبيق</button>
              </div>
              <p style={{ fontSize: "0.8rem", marginTop: "5px", color: promoMsg.includes("✅") ? "#81c784" : "#e57373" }}>{promoMsg}</p>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
              تغليف هدايا فخم (+{giftFee} ج.م)
            </label>
            
            {isGift && <textarea placeholder="اكتب رسالة الإهداء..." value={giftNote} onChange={(e) => setGiftNote(e.target.value)} style={{ width: "100%", marginBottom: "1.5rem", padding: "10px", borderRadius: "5px", border: "none" }} />}

            <div style={{ borderTop: "1px solid #555", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span>{lang === "ar" ? "المجموع:" : "Subtotal:"}</span>
                <span>{subtotal.toFixed(2)} ج.م</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#81c784" }}>
                <span>{lang === "ar" ? "الخصم:" : "Discount:"}</span>
                <span>-{discountAmount.toFixed(2)} ج.م</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", fontSize: "1.3rem", fontWeight: "bold" }}>
                <span>الإجمالي:</span>
                <span style={{ color: "#C9A96E" }}>{finalTotal.toFixed(2)} ج.م</span>
              </div>
            </div>

            <button onClick={proceedToCheckout} style={{ width: "100%", background: "#C9A96E", color: "#fff", border: "none", padding: "18px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" }}>
              إتمام الطلب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}