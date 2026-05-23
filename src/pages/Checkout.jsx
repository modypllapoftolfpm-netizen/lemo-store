import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { createOrder } from "../firebase/orders";

export default function Checkout() {
  const { items, clearCart, getTotal } = useCart();
  const { user, profile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const discount = location.state?.discount || 0;
  const { subtotal, total } = getTotal(discount);

  const [form, setForm] = useState({
    name: profile?.name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: "",
    paymentMethod: "card",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        userEmail: form.email,
        userName: form.name,
        userPhone: form.phone,
        address: form.address,
        items: items.map((i) => ({
          productId: i.id,
          nameAr: i.nameAr,
          nameEn: i.nameEn,
          price: i.price,
          qty: i.qty,
          imageUrl: i.imageUrl || "",
        })),
        subtotal,
        discount: subtotal - total,
        total,
        paymentMethod: form.paymentMethod,
        fawryRef: form.paymentMethod === "fawry" ? `FAWRY-${Date.now()}` : null,
      };
      const ref = await createOrder(orderData);
      clearCart();
      navigate(`/order-confirm/${ref.id}`);
    } catch (err) {
      alert("حدث خطأ، حاول مجدداً");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "12px", borderRadius: "10px",
    border: "1px solid #E8DDD0", fontSize: "1rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1rem"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>💳 {t.checkout.title}</h1>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Form */}
          <div style={{ flex: 2, minWidth: "300px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>{t.checkout.personalInfo}</h3>
              <form onSubmit={handleOrder}>
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.checkout.name}</label>
                <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />

                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.checkout.email}</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} />

                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.checkout.phone}</label>
                <input name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />

                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.checkout.address}</label>
                <input name="address" value={form.address} onChange={handleChange} required style={inputStyle} />

                {/* Payment Method */}
                <h3 style={{ color: "#3D2B1F", margin: "1rem 0" }}>{t.checkout.paymentMethod}</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {[
                    { value: "card", label: "💳 " + t.checkout.card },
                    { value: "wallet", label: "📱 " + t.checkout.wallet },
                    { value: "fawry", label: "🏪 " + t.checkout.fawry },
                  ].map((method) => (
                    <label key={method.value} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 16px", borderRadius: "10px", cursor: "pointer",
                      border: form.paymentMethod === method.value ? "2px solid #C9A96E" : "2px solid #E8DDD0",
                      background: form.paymentMethod === method.value ? "#FFF8F0" : "#fff",
                      fontWeight: "600"
                    }}>
                      <input
                        type="radio" name="paymentMethod" value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={handleChange}
                        style={{ display: "none" }}
                      />
                      {method.label}
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%", background: "#C9A96E", color: "#fff",
                  border: "none", borderRadius: "10px", padding: "14px",
                  fontSize: "1rem", fontWeight: "700", cursor: "pointer"
                }}>
                  {loading ? "جاري الإرسال..." : t.checkout.placeOrder}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>ملخص الطلب</h3>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <span style={{ color: "#3D2B1F" }}>{item.nameAr} × {item.qty}</span>
                  <span style={{ color: "#C9A96E", fontWeight: "600" }}>{item.price * item.qty} {t.currency}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: "1rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.1rem" }}>
                  <span>{t.cart.total}</span>
                  <span style={{ color: "#C9A96E" }}>{total} {t.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}