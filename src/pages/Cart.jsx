import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { validateCoupon } from "../firebase/coupons";
import Navbar from "../components/layout/Navbar";

export default function Cart() {
  const { items, removeFromCart, updateQty } = useCart();
  const { t, field } = useLang();
  const navigate = useNavigate();
  
  const [promo, setPromo] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [promoMsg, setPromoMsg] = useState("");

  // --- إضافات الإهداء ---
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const giftFee = 50; // سعر التغليف (يمكنك تغييره مستقبلاً)

  const handleApply = async () => {
    const data = await validateCoupon(promo);
    if (data) { setCoupon(data); setPromoMsg("✅ تم تطبيق الكوبون!"); }
    else { setCoupon(null); setPromoMsg("❌ كوبون غير صالح"); }
  };

  const subtotal = items.reduce((acc, i) => acc + (i.price * i.qty), 0);
  
  const totalAfterDiscount = items.reduce((acc, i) => {
    let price = i.price;
    if (coupon) {
        if (coupon.type === "global") price *= (1 - coupon.discount / 100);
        else if (coupon.type === "product" && i.id === coupon.targetId) price *= (1 - coupon.discount / 100);
        else if (coupon.type === "category" && i.categoryId === coupon.targetId) price *= (1 - coupon.discount / 100);
    }
    return acc + (price * i.qty);
  }, 0);

  // الإجمالي النهائي بعد إضافة رسوم التغليف إن وجدت
  const finalTotal = totalAfterDiscount + (isGift ? giftFee : 0);

  const proceedToCheckout = () => {
    navigate("/checkout", { 
      state: { 
        discount: coupon ? coupon.discount : 0, 
        total: finalTotal, 
        couponCode: coupon ? promo : "",
        isGift,
        giftNote
      } 
    });
  };

  return (
    <div dir="rtl" style={{ padding: "2rem", fontFamily: "Cairo" }}>
      <Navbar />
      <h1>🛒 السلة</h1>
      
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex", gap: "10px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
            <p>{field(item, "name")}</p>
            <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
            <span>{item.qty}</span>
            <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
            <button onClick={() => removeFromCart(item.id)}>حذف</button>
        </div>
      ))}

      <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1.5rem", borderRadius: "10px" }}>
          {/* خيارات الإهداء */}
          <label style={{ display: "block", marginBottom: "1rem", fontWeight: "bold" }}>
            <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
            تغليف هدايا فخم (+{giftFee} ج.م)
          </label>
          {isGift && (
            <textarea 
              placeholder="اكتب رسالة الإهداء هنا..." 
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              style={{ width: "100%", height: "80px", marginBottom: "1rem", padding: "10px" }}
            />
          )}

          <h3>الإجمالي قبل الخصم: {subtotal}</h3>
          <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="كود الخصم" />
          <button onClick={handleApply}>تطبيق</button>
          <p>{promoMsg}</p>
          <h3>الإجمالي النهائي: {finalTotal.toFixed(2)}</h3>
          
          <button onClick={proceedToCheckout} style={{ background: "#3D2B1F", color: "#fff", padding: "15px 30px", marginTop: "1rem" }}>
            إتمام الطلب
          </button>
      </div>
    </div>
  );
}