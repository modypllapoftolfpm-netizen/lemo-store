import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { validatePromoCode } from "../firebase/settings";

export default function Cart() {
  const { items, removeFromCart, updateQty, getTotal, clearCart } = useCart();
  const { t, field } = useLang();
  const navigate = useNavigate();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const { subtotal, total } = getTotal(discount);

  const handlePromo = async () => {
    const result = await validatePromoCode(promo);
    if (result.valid) {
      setDiscount(result.discount);
      setPromoMsg(`✅ خصم ${result.discount}% تم تطبيقه`);
    } else {
      setPromoMsg("❌ " + result.message);
    }
  };

  if (items.length === 0) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <div style={{ fontSize: "5rem" }}>🛒</div>
        <h2 style={{ color: "#3D2B1F" }}>{t.cart.empty}</h2>
        <Link to="/products" style={{
          background: "#C9A96E", color: "#fff",
          padding: "12px 30px", borderRadius: "25px",
          textDecoration: "none", fontWeight: "700"
        }}>تسوقي الآن</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>🛒 {t.cart.title}</h1>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Items */}
          <div style={{ flex: 2, minWidth: "300px" }}>
            {items.map((item) => (
              <div key={item.id} style={{
                background: "#fff", borderRadius: "16px",
                padding: "1rem", marginBottom: "1rem",
                display: "flex", gap: "1rem", alignItems: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}>
                <div style={{
                  width: "80px", height: "80px", background: "#FAF7F2",
                  borderRadius: "10px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "2rem", flexShrink: 0
                }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                    : "🕯️"}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 4px", color: "#3D2B1F", fontSize: "0.95rem" }}>
                    {field(item, "name")}
                  </h3>
                  <p style={{ color: "#C9A96E", fontWeight: "700", margin: "0 0 8px" }}>
                    {item.price} {t.currency}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      border: "1px solid #E8DDD0", background: "#fff",
                      cursor: "pointer", fontSize: "1rem"
                    }}>-</button>
                    <span style={{ fontWeight: "700" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      border: "1px solid #E8DDD0", background: "#fff",
                      cursor: "pointer", fontSize: "1rem"
                    }}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#cc0000", fontSize: "1.3rem"
                }}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ flex: 1, minWidth: "250px" }}>
            <div style={{
              background: "#fff", borderRadius: "16px",
              padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>ملخص الطلب</h3>

              {/* Promo */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder={t.cart.promoCode}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "8px",
                    border: "1px solid #E8DDD0", outline: "none"
                  }}
                />
                <button onClick={handlePromo} style={{
                  background: "#C9A96E", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "8px 12px", cursor: "pointer"
                }}>{t.cart.applyPromo}</button>
              </div>
              {promoMsg && <p style={{ fontSize: "0.85rem", marginBottom: "1rem", color: discount > 0 ? "green" : "red" }}>{promoMsg}</p>}

              <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#8B7355" }}>{t.cart.subtotal}</span>
                  <span>{subtotal} {t.currency}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "green" }}>
                    <span>{t.cart.discount}</span>
                    <span>- {subtotal - total} {t.currency}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.1rem", borderTop: "1px solid #E8DDD0", paddingTop: "8px" }}>
                  <span>{t.cart.total}</span>
                  <span style={{ color: "#C9A96E" }}>{total} {t.currency}</span>
                </div>
              </div>

              <button onClick={() => navigate("/checkout", { state: { discount, total } })} style={{
                width: "100%", background: "#C9A96E", color: "#fff",
                border: "none", borderRadius: "10px", padding: "14px",
                fontSize: "1rem", fontWeight: "700", cursor: "pointer", marginTop: "1rem"
              }}>{t.cart.checkout} ←</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}