import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/layout/Navbar";

export default function CheckoutPage() {
  const { total, items, couponCode, discount, isGift, giftNote } = useLocation().state || { 
    total: 0, items: [], couponCode: "", discount: 0, isGift: false, giftNote: "" 
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: "4rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {/* ملخص الطلب - عشان العميل يراجع اللي اختاره */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid #E8DDD0", boxShadow: "0 5px 20px rgba(0,0,0,0.03)" }}>
          <h3 style={{ color: "#3D2B1F", marginBottom: "1.5rem", textAlign: "center" }}>🛒 ملخص طلبك</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
             {items.map((item, idx) => (
               <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                 <span>{item.nameAr} (x{item.quantity})</span>
                 <span>{item.price * item.quantity} ج.م</span>
               </div>
             ))}
          </div>
          <div style={{ borderTop: "1px solid #FAF7F2", paddingTop: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: "800", color: "#3D2B1F" }}>الإجمالي: {total} ج.م</p>
            {couponCode && <p style={{ color: "green", fontSize: "0.85rem" }}>كود الخصم: {couponCode} ({discount}%)</p>}
          </div>
        </div>

        {/* الرسالة الفخمة وزر الواتساب */}
        <div style={{ 
          background: "#fff", 
          padding: "3rem", 
          borderRadius: "24px", 
          border: "1px solid #E8DDD0", 
          textAlign: "center", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)" 
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
          <h2 style={{ color: "#3D2B1F", marginBottom: "1.5rem" }}>اللمسات الأخيرة</h2>
          <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "2.5rem" }}>
            لأن كل قطعة في Lemo Store صنعت خصيصاً لك بلمسة فنية مميزة، يسعدنا التواصل معك لتنسيق كافة التفاصيل وضمان أن طلبك سيكون تماماً كما تخيلته. تواصل معنا الآن لإتمام اللمسات الأخيرة لطلبك.
          </p>
          
          <a
            href={`https://wa.me/201009633100?text=مرحباً، أريد إتمام طلبي من Lemo Store. الإجمالي: ${total} ج.م`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: "#25D366",
              color: "#fff",
              padding: "16px 40px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "900",
              fontSize: "1.1rem",
              transition: "transform 0.3s, background 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            <span>💬</span> تواصل عبر الواتساب
          </a>
        </div>

      </div>
    </div>
  );
}