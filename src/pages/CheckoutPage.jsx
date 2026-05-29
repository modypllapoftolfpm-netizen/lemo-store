import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/layout/Navbar";

export default function CheckoutPage() {
  const { total, items, couponCode, discount, isGift, giftNote } = useLocation().state || { 
    total: 0, items: [], couponCode: "", discount: 0, isGift: false, giftNote: "" 
  };

  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  // دالة تجهيز رسالة الواتساب
  const getWhatsAppLink = () => {
    let message = `مرحباً Lemo Store، أريد إتمام هذا الطلب:%0A%0A`;
    message += `الاسم: ${formData.name}%0A`;
    message += `الهاتف: ${formData.phone}%0A`;
    message += `العنوان: ${formData.address}%0A%0A`;
    message += `الطلبات:%0A`;
    items.forEach(item => {
      message += `- ${item.nameAr} (x${item.quantity}) = ${item.price * item.quantity} ج.م%0A`;
    });
    message += `%0Aالإجمالي: ${total} ج.م`;
    if (isGift) message += `%0A%0A🎁 ملاحظة هدية: ${giftNote}`;
    
    return `https://wa.me/201009633100?text=${message}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: "4rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {/* ملخص الطلب */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid #E8DDD0", boxShadow: "0 5px 20px rgba(0,0,0,0.03)" }}>
          <h3 style={{ color: "#3D2B1F", marginBottom: "1rem", textAlign: "center" }}>🛒 ملخص طلبك</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
             {items.map((item, idx) => (
               <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                 <span>{item.nameAr} (x{item.quantity})</span>
                 <span>{item.price * item.quantity} ج.م</span>
               </div>
             ))}
          </div>
          <div style={{ borderTop: "1px solid #FAF7F2", marginTop: "1rem", paddingTop: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: "800", color: "#3D2B1F" }}>الإجمالي: {total} ج.م</p>
          </div>
        </div>

        {/* فورم إدخال البيانات */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "24px", border: "1px solid #E8DDD0", marginBottom: "2rem" }}>
           <h4 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>بيانات التوصيل</h4>
           <input placeholder="الاسم الكريم" onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "14px", marginBottom: "15px", borderRadius: "12px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} />
           <input placeholder="رقم الهاتف" onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: "100%", padding: "14px", marginBottom: "15px", borderRadius: "12px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} />
           <textarea placeholder="العنوان بالتفصيل" onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #E8DDD0", boxSizing: "border-box", height: "80px" }} />
        </div>

        {/* الرسالة والزرار */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "24px", border: "1px solid #E8DDD0", textAlign: "center" }}>
          <p style={{ color: "#555", fontSize: "1rem", lineHeight: "1.8", marginBottom: "2rem" }}>
            لأن كل قطعة في Lemo Store صنعت خصيصاً لك بلمسة فنية مميزة، يسعدنا التواصل معك لتنسيق كافة التفاصيل وضمان أن طلبك سيكون تماماً كما تخيلته. تواصل معنا الآن لإتمام اللمسات الأخيرة لطلبك.
          </p>
          
          <a
            href={formData.name && formData.phone ? getWhatsAppLink() : "#"}
            onClick={(e) => {
              if(!formData.name || !formData.phone) {
                e.preventDefault();
                alert("برجاء إدخال الاسم ورقم الهاتف أولاً");
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: formData.name && formData.phone ? "#25D366" : "#ccc",
              color: "#fff",
              padding: "16px 40px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "900",
              transition: "0.3s"
            }}
          >
            <span>💬</span> إرسال الطلب عبر الواتساب
          </a>
        </div>
      </div>
    </div>
  );
}