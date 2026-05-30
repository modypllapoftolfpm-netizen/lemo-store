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
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  
  const discount = Number(location.state?.discount) || 0;
  const { subtotal, total } = getTotal(discount);
  const safeTotal = typeof total === "number" && !isNaN(total) ? total : 0;
  const safeSubtotal = typeof subtotal === "number" && !isNaN(subtotal) ? subtotal : 0;
  
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
        userId: user?.uid || "guest",
        userEmail: form.email,
        userName: form.name,
        userPhone: form.phone,
        address: form.address,
        items: items.map((i) => ({
          productId: i.id,
          nameAr: i.nameAr || "منتج",
          nameEn: i.nameEn || "Product",
          price: Number(i.price) || 0,
          qty: Number(i.qty) || 1,
          image: i.image || "", 
        })),
        subtotal: safeSubtotal,
        discount: safeSubtotal - safeTotal,
        total: safeTotal,
        paymentMethod: "contact",
        status: "pending",
      };
      
      await createOrder(orderData);
      clearCart();
      setStep(3); 
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مجدداً.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: "2px solid #F0E8DF", fontSize: "1rem", color: "#3D2B1F",
    outline: "none", boxSizing: "border-box", marginBottom: "1.2rem",
    background: "#FCFAFC", transition: "0.3s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {step < 3 && (
          <>
            <h1 style={{ color: "#3D2B1F", marginBottom: "2rem", fontSize: "2rem", fontWeight: "900" }}>💳 إتمام الطلب</h1>
            <div style={{ display: "flex", marginBottom: "2.5rem", background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              {["بيانات التوصيل", "تأكيد الطلب"].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "16px", textAlign: "center", background: step === i + 1 ? "linear-gradient(135deg, #C9A96E, #b8925a)" : step > i + 1 ? "#FAF8F5" : "#fff", color: step === i + 1 ? "#fff" : step > i + 1 ? "#C9A96E" : "#A89A8E", fontWeight: "800", fontSize: "1rem", transition: "all 0.4s" }}>
                  {step > i + 1 ? "✓" : `${i + 1}.`} {s}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", flexDirection: step === 3 ? "column" : "row" }}>
          
          {step < 3 && (
            <div style={{ flex: 2, minWidth: "300px" }}>
              {step === 1 && (
                <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", boxShadow: "0 10px 40px rgba(61,43,31,0.05)", border: "1px solid #E8DDD0" }}>
                  <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "800" }}>👤 بيانات التوصيل</h3>
                  <label style={{ display: "block", marginBottom: "8px", color: "#666", fontWeight: "700", fontSize: "0.9rem" }}>الاسم الكريم</label>
                  <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="أدخل اسمك بالكامل" />
                  <label style={{ display: "block", marginBottom: "8px", color: "#666", fontWeight: "700", fontSize: "0.9rem" }}>رقم الهاتف للتواصل</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={inputStyle} placeholder="01xxxxxxxxx" />
                  <label style={{ display: "block", marginBottom: "8px", color: "#666", fontWeight: "700", fontSize: "0.9rem" }}>العنوان بالتفصيل</label>
                  <textarea name="address" value={form.address} onChange={handleChange} style={{...inputStyle, resize: "none", minHeight: "100px"}} placeholder="المحافظة، المنطقة، الشارع، رقم العقار..." />
                  <button onClick={() => { if (!form.name || !form.phone || !form.address) { alert("برجاء ملء كافة البيانات المطلوبة لتوصيل طلبك."); return; } setStep(2); }} style={{ width: "100%", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "12px", padding: "16px", fontSize: "1.1rem", fontWeight: "800", cursor: "pointer", marginTop: "1rem", transition: "0.3s" }}>
                    متابعة لتأكيد الطلب ←
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", boxShadow: "0 10px 40px rgba(61,43,31,0.05)", border: "1px solid #E8DDD0", animation: "fadeIn 0.4s" }}>
                  <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "800" }}>📋 مراجعة بياناتك</h3>
                  <div style={{ background: "#FAF8F5", padding: "1.5rem", borderRadius: "12px" }}>
                    {[
                      { label: "الاسم", value: form.name },
                      { label: "رقم الهاتف", value: form.phone },
                      { label: "عنوان التوصيل", value: form.address },
                    ].map((f, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: idx !== 2 ? "1px dashed #E8DDD0" : "none" }}>
                        <span style={{ color: "#8B7355", fontWeight: "600" }}>{f.label}:</span>
                        <span style={{ color: "#3D2B1F", fontWeight: "800", textAlign: "left" }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "2rem" }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, background: "#fff", border: "2px solid #E8DDD0", color: "#3D2B1F", borderRadius: "12px", padding: "14px", cursor: "pointer", fontWeight: "700", fontSize: "1rem" }}>تعديل البيانات</button>
                    <button onClick={handleOrder} disabled={loading} style={{ flex: 2, background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", cursor: "pointer", fontWeight: "800", fontSize: "1.1rem", boxShadow: "0 6px 20px rgba(201,169,110,0.3)" }}>
                      {loading ? "جاري تسجيل الطلب..." : "تأكيد الطلب النهائي ✓"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step < 3 && (
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", boxShadow: "0 10px 40px rgba(61,43,31,0.05)", border: "1px solid #E8DDD0", position: "sticky", top: "20px" }}>
                <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontSize: "1.2rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}><span>🛒</span> ملخص طلبك</h3>
                <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "5px" }}>
                  {items.map((item) => {
                    const qty = Number(item.qty) || 1;
                    const price = Number(item.price) || 0;
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #FAF8F5" }}>
                        {item.image ? <img src={item.image} style={{ width: "60px", height: "60px", borderRadius: "10px", objectFit: "cover", border: "1px solid #F0E8DF" }} alt={item.nameAr} /> : <div style={{ width: "60px", height: "60px", borderRadius: "10px", background: "#FAF8F5", display: "flex", alignItems: "center", justifyContent: "center" }}>🕯️</div>}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#3D2B1F", fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px" }}>{item.nameAr}</div>
                          <div style={{ color: "#8B7355", fontSize: "0.85rem", fontWeight: "600" }}>الكمية: {qty}</div>
                        </div>
                        <span style={{ color: "#C9A96E", fontWeight: "800", fontSize: "1rem" }}>{price * qty} ج.م</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: "#FAF8F5", padding: "1.2rem", borderRadius: "12px", marginTop: "1rem" }}>
                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#E74C3C", fontWeight: "700", fontSize: "0.95rem" }}><span>قيمة الخصم</span><span>- {discount} ج.م</span></div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "900", fontSize: "1.3rem", color: "#3D2B1F", borderTop: discount > 0 ? "1px solid #E8DDD0" : "none", paddingTop: discount > 0 ? "8px" : "0" }}>
                    <span>الإجمالي</span><span style={{ color: "#C9A96E" }}>{safeTotal.toFixed(0)} ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ background: "#fff", borderRadius: "24px", padding: "4rem 2rem", boxShadow: "0 15px 50px rgba(61,43,31,0.08)", border: "1px solid #E8DDD0", textAlign: "center", maxWidth: "650px", margin: "0 auto", animation: "fadeIn 0.6s ease-out" }}>
              <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>✨</div>
              <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontSize: "2.2rem", fontWeight: "900" }}>تم تسجيل طلبك بنجاح!</h2>
              <div style={{ width: "80px", height: "4px", background: "linear-gradient(135deg, #C9A96E, #b8925a)", margin: "0 auto 2rem", borderRadius: "2px" }}></div>
              <p style={{ color: "#555", fontSize: "1.2rem", lineHeight: "1.9", marginBottom: "3rem", fontWeight: "600" }}>
                لأن كل قطعة في <span style={{ color: "#3D2B1F", fontWeight: "900" }}>Lemo Store</span> صنعت خصيصاً لك بلمسة فنية مميزة، <span style={{ color: "#C9A96E" }}> يسعدنا تواصلك معنا </span> لتنسيق كافة التفاصيل وضمان أن طلبك سيكون تماماً كما تخيلته. تواصل معنا الآن لإتمام اللمسات الأخيرة لطلبك.
              </p>
              <a href={`https://wa.me/201009633100?text=أهلاً LEMO، قمت بتسجيل طلب باسم: ${form.name} وأريد استكمال اللمسات الأخيرة لطلبي.`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px", background: "#25D366", color: "#fff", padding: "18px 40px", borderRadius: "50px", textDecoration: "none", fontSize: "1.2rem", fontWeight: "800", boxShadow: "0 8px 25px rgba(37,211,102,0.35)", transition: "0.3s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-3px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
                 <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                 </svg>
                 تواصلك معنا عبر الواتساب
              </a>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}