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
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: "",
  });

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
          image: i.image || "", // تأكدنا من حفظ رابط الصورة هنا
        })),
        subtotal,
        discount: subtotal - total,
        total,
        paymentMethod: "contact",
        status: "pending",
      };
      const ref = await createOrder(orderData);
      clearCart();
      navigate(`/order-confirm/${ref.id}`);
    } catch (err) {
      console.error(err);
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
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>💳 {t.checkout.title || "إتمام الطلب"}</h1>

        {/* Steps */}
        <div style={{ display: "flex", gap: "0", marginBottom: "2rem", background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          {["بياناتك", "تأكيد الطلب", "طريقة الدفع"].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "12px", textAlign: "center", background: step === i + 1 ? "#C9A96E" : step > i + 1 ? "#FAF7F2" : "#fff", color: step === i + 1 ? "#fff" : "#8B7355", fontWeight: "700", fontSize: "0.9rem", transition: "all 0.3s" }}>
              {step > i + 1 ? "✅" : `${i + 1}.`} {s}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "300px" }}>

            {step === 1 && (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>👤 بياناتك الشخصية</h3>
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>الاسم الكامل</label>
                <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>البريد الإلكتروني</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>رقم الهاتف</label>
                <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
                <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>عنوان التوصيل</label>
                <input name="address" value={form.address} onChange={handleChange} style={inputStyle} />
                <button onClick={() => { if (!form.name || !form.phone || !form.address) { alert("برجاء ملء كل البيانات"); return; } setStep(2); }} style={{ width: "100%", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}>
                  التالي ←
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>📋 تأكيد بياناتك</h3>
                {[
                  { label: "الاسم", value: form.name },
                  { label: "الهاتف", value: form.phone },
                  { label: "العنوان", value: form.address },
                  { label: "الإجمالي", value: `${total} ج.م` },
                ].map((f) => (
                  <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0E8DF" }}>
                    <span style={{ color: "#8B7355" }}>{f.label}</span>
                    <span style={{ color: "#3D2B1F", fontWeight: "700" }}>{f.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: "#FAF7F2", border: "1px solid #E8DDD0", color: "#3D2B1F", borderRadius: "10px", padding: "12px", cursor: "pointer", fontWeight: "600" }}>← رجوع</button>
                  <button onClick={handleOrder} disabled={loading} style={{ flex: 2, background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", cursor: "pointer", fontWeight: "700" }}>
                    {loading ? "جاري الإرسال..." : "تأكيد الطلب ✓"}
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3 (Contact) - same as your previous code */}
          </div>

          {/* ملخص الطلب مع الصور */}
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>ملخص الطلب</h3>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", fontSize: "0.9rem" }}>
                  <img src={item.image} style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "#3D2B1F" }}>{item.nameAr} × {item.qty}</span>
                  </div>
                  <span style={{ color: "#C9A96E", fontWeight: "600" }}>{item.price * item.qty} ج.م</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: "1rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.1rem" }}>
                  <span>الإجمالي</span>
                  <span style={{ color: "#C9A96E" }}>{total.toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}