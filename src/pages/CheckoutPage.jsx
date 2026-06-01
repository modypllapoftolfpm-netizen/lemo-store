import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import { createOrder } from "../firebase/orders"; // تأكد إن مسار الفايربيز صح

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
    const qty = Number(item.quantity || item.qty) || 1; // دعم quantity أو qty
    return acc + (price * qty);
  }, 0);
  const safeTotal = Math.max(0, safeSubtotal - discount);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [orderId, setOrderId] = useState(""); // 👈 حالة جديدة لحفظ رقم الطلب للعميل

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
          nameAr: i.nameAr || i.name || "منتج", // 👈 خلينا الاسم يتبعت صح للأدمن
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

      // 👈 استلام الـ ID بعد إنشاء الطلب
      const docRef = await createOrder(orderData); 
      if (docRef && docRef.id) {
        setOrderId(docRef.id.slice(-8).toUpperCase()); // حفظ آخر 8 حروف
      }

      if (clearCart) clearCart(); // تفريغ السلة
      setStep(2); // الانتقال لخطوة رسالة النجاح والواتساب
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
      
      <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {step === 1 && (
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", flexDirection: "row-reverse" }}>
            
            {/* ملخص الطلب */}
            <div style={{ flex: 1, minWidth: "300px", background: "#fff", padding: "2rem", borderRadius: "24px", border: "1px solid #E8DDD0", boxShadow: "0 5px 20px rgba(0,0,0,0.03)", height: "fit-content" }}>
              <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", textAlign: "center", fontWeight: "900" }}>🛒 ملخص طلبك</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
                 {actualItems.map((item, idx) => {
                   const qty = Number(item.quantity || item.qty) || 1;
                   const price = Number(item.price) || 0;
                   return (
                     <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#555", fontWeight: "bold", paddingBottom: "10px", borderBottom: "1px dashed #FAF8F5" }}>
                       <span>{item.nameAr || item.name} (x{qty})</span>
                       <span style={{ color: "#C9A96E" }}>{price * qty} ج.م</span>
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
            <div style={{ flex: 2, minWidth: "300px", background: "#fff", padding: "2rem", borderRadius: "24px", border: "1px solid #E8DDD0", boxShadow: "0 5px 20px rgba(0,0,0,0.03)" }}>
               <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", fontWeight: "900" }}>بيانات التوصيل</h3>
               <form onSubmit={handleOrder}>
                 <label style={{ display: "block", marginBottom: "8px", color: "#8B7355", fontWeight: "bold", fontSize: "0.9rem" }}>الاسم</label>
                 <input placeholder="أدخل الاسم بالكامل" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                 
                 <label style={{ display: "block", marginBottom: "8px", color: "#8B7355", fontWeight: "bold", fontSize: "0.9rem" }}>رقم الهاتف</label>
                 <input placeholder="01xxxxxxxxx" required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{...inputStyle, textAlign: "right"}} />
                 
                 <label style={{ display: "block", marginBottom: "8px", color: "#8B7355", fontWeight: "bold", fontSize: "0.9rem" }}>العنوان بالتفصيل</label>
                 <textarea placeholder="المحافظة، المنطقة، الشارع..." required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ ...inputStyle, height: "100px", resize: "none" }} />
                 
                 <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "16px", borderRadius: "12px", border: "none", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", transition: "0.3s", boxShadow: "0 4px 15px rgba(201,169,110,0.3)" }}>
                   {loading ? "جاري تسجيل الطلب..." : "متابعة لتأكيد الطلب ➔"}
                 </button>
               </form>
            </div>
          </div>
        )}

        {/* 🛠️ خطوة الواتساب (تظهر فقط بعد التأكيد) */}
        {step === 2 && (
          <div style={{ background: "#fff", padding: "4rem 2rem", borderRadius: "24px", border: "1px solid #E8DDD0", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", animation: "fadeIn 0.5s" }}>
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>✨</div>
            <h2 style={{ color: "#3D2B1F", marginBottom: "1rem", fontSize: "2rem", fontWeight: "900" }}>تم تسجيل طلبك بنجاح!</h2>
            
            {/* 👈 هنا بنعرض رقم الطلب للعميل */}
            <h3 style={{ color: "#C9A96E", marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: "bold", background: "#FAF8F5", padding: "10px", borderRadius: "12px", display: "inline-block" }}>
              رقم طلبك: #{orderId}
            </h3>

            <div style={{ width: "60px", height: "4px", background: "#C9A96E", margin: "0 auto 1.5rem", borderRadius: "2px" }}></div>
            <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "3rem", fontWeight: "600", maxWidth: "600px", margin: "0 auto 3rem" }}>
              لأن كل قطعة في <strong style={{ color: "#3D2B1F" }}>Lemo Store</strong> صنعت خصيصاً لك بلمسة فنية مميزة، يسعدنا التواصل معك لتنسيق كافة التفاصيل وضمان أن طلبك سيكون تماماً كما تخيلته. تواصل معنا الآن لإتمام اللمسات الأخيرة لطلبك.
            </p>
            
            {/* 👈 تعديل رسالة الواتساب عشان يكون فيها رقم الطلب */}
            <a
              href={`https://wa.me/201009633100?text=أهلاً Lemo Store، قمت بتسجيل طلب رقم #${orderId} باسم: ${formData.name} وأريد استكمال اللمسات الأخيرة لطلبي.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px",
                background: "#25D366", color: "#fff", padding: "16px 40px", borderRadius: "50px",
                textDecoration: "none", fontWeight: "900", fontSize: "1.1rem", transition: "0.3s",
                boxShadow: "0 5px 20px rgba(37,211,102,0.3)"
              }}
            >
              <span>💬</span> تواصلك معنا عبر الواتساب
            </a>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}