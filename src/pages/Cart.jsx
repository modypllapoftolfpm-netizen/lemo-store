import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LangContext";
import Navbar from "../components/layout/Navbar";

export default function Cart() {
  const { items, removeFromCart, updateQty } = useCart();
  const { field, lang, t } = useLang();
  const navigate = useNavigate();

  // خيارات الإهداء
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const giftFee = 50;

  // الحسابات (مع التأكد إن السعر رقم عشان الـ NaN تختفي)
  const subtotal = items.reduce((acc, i) => acc + (parseFloat(i.price || 0) * i.qty), 0);
  const finalTotal = subtotal + (isGift ? giftFee : 0);

  const proceedToCheckout = () => {
    navigate("/checkout", { state: { total: finalTotal, isGift, giftNote } });
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }}>
      <Navbar />
      
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>{lang === "ar" ? "حقيبة التسوق" : "Shopping Bag"}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
          
          {/* جزء المنتجات */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "15px", boxShadow: "0 2px 15px rgba(0,0,0,0.05)" }}>
            {items.length === 0 ? <p>السلة فارغة</p> : items.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid #f0e8df", paddingBottom: "1rem", marginBottom: "1rem" }}>
                <img src={item.image} style={{ width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{field(item, "name")}</h3>
                  <p style={{ color: "#C9A96E", fontWeight: "bold" }}>{item.price} ج.م</p>
                </div>
                {/* أزرار التحكم */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "#eee", border: "none", width: "30px", cursor: "pointer" }}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: "#eee", border: "none", width: "30px", cursor: "pointer" }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "transparent", border: "none", color: "#ff4d4d", cursor: "pointer" }}>حذف</button>
                </div>
              </div>
            ))}
          </div>

          {/* جزء ملخص الطلب */}
          <div style={{ background: "#3D2B1F", color: "#fff", padding: "2rem", borderRadius: "15px", height: "fit-content" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>{lang === "ar" ? "ملخص الطلب" : "Order Summary"}</h2>
            
            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem", cursor: "pointer" }}>
              <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
              تغليف هدايا فخم (+{giftFee} ج.م)
            </label>
            
            {isGift && <textarea placeholder="اكتب رسالة الإهداء..." value={giftNote} onChange={(e) => setGiftNote(e.target.value)} style={{ width: "100%", marginBottom: "1rem", padding: "10px", borderRadius: "5px" }} />}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderTop: "1px solid #555", paddingTop: "1rem" }}>
              <span>الإجمالي:</span>
              <span style={{ fontWeight: "bold", color: "#C9A96E" }}>{finalTotal.toFixed(2)} ج.م</span>
            </div>

            <button onClick={proceedToCheckout} style={{ width: "100%", background: "#C9A96E", color: "#fff", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              إتمام الطلب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}