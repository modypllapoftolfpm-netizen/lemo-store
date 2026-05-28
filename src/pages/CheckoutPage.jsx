import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // استقبلنا كل البيانات (بما فيها بيانات الإهداء)
  const { discount, total, couponCode, isGift, giftNote } = location.state || { 
    discount: 0, 
    total: 0, 
    couponCode: "",
    isGift: false,
    giftNote: "" 
  };
  
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!formData.name || !formData.phone) return alert("الرجاء إدخال البيانات");
    setLoading(true);
    
    try {
      // حفظ الطلب في الفايربيس مع بيانات الكوبون والإهداء
      await addDoc(collection(db, "orders"), {
        userId: user?.uid || "guest",
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        items: items,
        totalPrice: total,             
        couponCode: couponCode || null,
        discountPercent: discount,
        // بيانات الإهداء
        isGift: isGift,
        giftNote: giftNote,
        //
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      clearCart();
      navigate("/orders");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ، حاول مرة أخرى");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", padding: "2rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "2rem auto", background: "#fff", padding: "2rem", borderRadius: "15px" }}>
        <h2>إتمام الطلب</h2>
        <input placeholder="الاسم" onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ display: "block", width: "100%", padding: "10px", margin: "10px 0" }} />
        <input placeholder="رقم الهاتف" onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ display: "block", width: "100%", padding: "10px", margin: "10px 0" }} />
        <input placeholder="العنوان" onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ display: "block", width: "100%", padding: "10px", margin: "10px 0" }} />
        
        <div style={{ margin: "1rem 0", padding: "1rem", background: "#f9f9f9", borderRadius: "8px" }}>
            <p>الإجمالي المطلوب: <strong>{total} ج.م</strong></p>
            {couponCode && <p style={{ color: "green" }}>كود الخصم المستخدم: {couponCode} ({discount}%)</p>}
            {isGift && <p style={{ color: "#3D2B1F" }}>🎁 طلب هدية مع رسالة: {giftNote}</p>}
        </div>

        <button onClick={placeOrder} disabled={loading} style={{ width: "100%", padding: "15px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "8px" }}>
          {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
        </button>
      </div>
    </div>
  );
}