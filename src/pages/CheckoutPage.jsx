import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import { createOrder } from "../firebase/orders"; 

export default function CheckoutPage() {
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // استقبال البيانات بأمان
  const locationState = useLocation().state || {};
  const passedItems = locationState.items || [];
  const discount = Number(locationState.discount) || 0;
  const isGift = locationState.isGift || false;
  const giftNote = locationState.giftNote || "";

  // الاعتماد على السلة لو موجودة، أو المنتجات الممررة
  const actualItems = cartItems?.length > 0 ? cartItems : passedItems;

  // 🛠️ الحل الجذري لمشكلة الـ NaN (حساب الإجمالي يدوياً وبأمان)
  const safeSubtotal = actualItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity || item.qty) || 1; 
    return acc + (price * qty);
  }, 0);
  const safeTotal = Math.max(0, safeSubtotal - discount);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [orderId, setOrderId] = useState(""); 

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      return alert("برجاء إدخال كافة بيانات التوصيل");
    }
    
    setLoading(true);
    try {
      const orderData = {
        userId: user?.uid || "guest",
        userName: formData.name,
        userPhone: formData.phone,
        address: formData.address,
        items: actualItems.map(i => ({
          productId: i.id || i.productId || "unknown",
          nameAr: i.nameAr || i.name || "منتج", 
          price: Number(i.price) || 0,
          qty: Number(i.quantity || i.qty) || 1
        })),
        subtotal: safeSubtotal,
        discount: discount,
        total: safeTotal,
        isGift,
        giftNote,
        status: "pending",
        createdAt: new Date()
      };

      const docRef = await createOrder(orderData); 
      if (docRef && docRef.id) {
        setOrderId(docRef.id.slice(-8).toUpperCase());
      }

      if (clearCart) clearCart(); 
      setStep(2); 
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px", marginBottom: "15px", 
    borderRadius: "12px", border: "2px solid #F0E8DF", 
    background: "#FCFAFC", boxSizing: "border-box", 
    outline: "none", fontFamily: "Cairo", color: "#3D2B1F", fontSize: "1rem"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", paddingBottom: "4rem", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      
      {/* 📱 أكواد الـ CSS للتجاوب مع الموبايل */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .checkout-layout {
          display: flex;
          gap: 2rem;
          flex-direction: row-reverse;
          align-items: flex-start;
        }
        
        .form-section, .summary-section {
          background: #fff;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid #E8DDD0;
          box-shadow: 0 5px 20px rgba(0,0,0,0.03);
        }
        
        .form-section { flex: 2; min-width: 300px; }
        .summary-section { flex: 1; min-width: 300px; position: sticky; top: 20px; }
        
        .success-box {
          background: #fff; padding: 4rem 2rem; border-radius: 24px; border: 1px solid #E8DDD0; 
          text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.05); animation: fadeIn 0.5s;
        }

        .whatsapp-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          background: #25D366; color: #fff; padding: 16px 40px; border-radius: 50px;
          text-decoration: none; font-weight: 900; font-size: 1.1rem; transition: 0.3s;
          box-shadow: 0 5px 20px rgba(37,211,102,0.3);
        }

        /* تعديلات شاشات الموبايل */
        @media (max-width: 768px) {
          .checkout-layout {
            flex-direction: column; /* الفورم الأول وبعدين الملخص */
            gap: 1.5rem;
          }
          .form-section, .summary-section {
            width: 100%;
            min-width: 100%;
            padding: 1.5rem;
            box-sizing: border-box;
          }
          .summary-section { position: static; } /* إلغاء التثبيت على الموبايل عشان الشاشة متتعلقش */
          .success-box { padding: 2rem 1rem; }
          .whatsapp-btn { width: 100%; box-sizing: border-box; font-size: 1rem; padding: 16px 20px; }
        }
      `}</style>

      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {step === 1 && (
          <div className="checkout-layout">
            
            {/* ملخص الطلب */}
            <div className="summary-section">
              <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", textAlign: "center", fontWeight: "900" }}>🛒 ملخص طلبك</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
                 {actualItems.map((item, idx) => {
                   const qty = Number(item.quantity || item.qty) || 1;
                   const price = Number(item.price) || 0;
                   return (
                     <div key={idx} style={{ display: "flex", justify-content: "space-between", color: "#555", fontWeight: "bold", paddingBottom: "10px", borderBottom: "1px dashed #FAF8F5" }}>
                       <span style={{flex: 1, paddingLeft: "10px"}}>{item.nameAr || item.name} (x{qty})</span>
                       <span style={{ color: "#C9A96E", whiteSpace: "nowrap" }}>{price * qty} ج.م</span>
                     </div>
                   );
                 })}
              </div>
              <div style={{ background: "#FAF8F5", padding: "1rem", borderRadius: "12px", marginTop: "1rem" }}>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#E74C3C", marginBottom: "5px", fontWeight: "bold" }}>
                    <span>خصم:</span> <span>- {discount} ج.م</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "900", color: "#3D2B1F" }}>
                  <span>الإجمالي:</span> <span>{safeTotal} ج.م</span>
                </div>
              </div>
            </div>

            {/* فورم إدخال البيانات */}
            <div className="form-section">
               <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontWeight: "900" }}>بيانات التوصيل</h3>
               <form onSubmit={handleOrder}>
                 <label style={{ display: "block", marginBottom: "8px", color: "#8B7355", fontWeight: "bold", fontSize: "0.9rem" }}>الاسم</label>
                 <input placeholder="أدخل الاسم بالكامل" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                 
                 <label style={{ display: "block", marginBottom: "8px", color: "#8B7355", fontWeight: "bold", fontSize: "0.9rem" }}>رقم الهاتف</label>
                 <input placeholder="01xxxxxxxxx" required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{...inputStyle, textAlign: "right"}} />
                 
                 <label style={{ display: "block", marginBottom: "8px", color: "#8B7355", fontWeight: "bold", fontSize: "0.9rem" }}>العنوان بالتفصيل</label>
                 <textarea placeholder="المحافظة، المنطقة، الشارع..." required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ ...inputStyle, height: "100px", resize: "none" }} />
                 
                 <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "16px", borderRadius: "12px", border: "none", fontSize: "1.1rem", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", transition: "0.3s", boxShadow: "0 4px 15px rgba(201,169,110,0.3)", marginTop: "10px" }}>
                   {loading ? "جاري تسجيل الطلب..." : "متابعة لتأكيد الطلب ➔"}
                 </button>
               </form>
            </div>
          </div>
        )}

        {/* 🛠️ خطوة الواتساب (تظهر فقط بعد التأكيد) */}
        {step === 2 && (
          <div className="success-box">
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>✨</div>
            <h2 style={{ color: "#3D2B1F", marginBottom: "1rem", fontSize: "2rem", fontWeight: "900" }}>تم تسجيل طلبك بنجاح!</h2>
            
            <h3 style={{ color: "#C9A96E", marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: "bold", background: "#FAF8F5", padding: "10px", borderRadius: "12px", display: "inline-block" }}>
              رقم طلبك: #{orderId}
            </h3>

            <div style={{ width: "60px", height: "4px", background: "#C9A96E", margin: "0 auto 1.5rem", borderRadius: "2px" }}></div>
            <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "3rem", fontWeight: "600", maxWidth: "600px", margin: "0 auto 3rem" }}>
              لأن كل قطعة في <strong style={{ color: "#3D2B1F" }}>Lemo Store</strong> صنعت خصيصاً لك بلمسة فنية مميزة، يسعدنا التواصل معك لتنسيق كافة التفاصيل وضمان أن طلبك سيكون تماماً كما تخيلته. تواصل معنا الآن لإتمام اللمسات الأخيرة لطلبك.
            </p>
            
            <a
              href={`https://wa.me/201009633100?text=أهلاً Lemo Store، قمت بتسجيل طلب رقم #${orderId} باسم: ${formData.name} وأريد استكمال اللمسات الأخيرة لطلبي.`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              <span>💬</span> تواصلك معنا عبر الواتساب
            </a>
          </div>
        )}
      </div>
    </div>
  );
}