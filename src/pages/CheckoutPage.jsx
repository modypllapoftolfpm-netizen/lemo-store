import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";

import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config"; 

export default function CheckoutPage() {
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const locationState = useLocation().state || {};
  const passedItems = locationState.items || [];
  const discount = Number(locationState.discount) || 0;
  const isGift = locationState.isGift || false;
  const giftNote = locationState.giftNote || "";

  const actualItems = cartItems?.length > 0 ? cartItems : passedItems;

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

    const generatedOrderId = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    try {
      const orderData = {
        orderId: generatedOrderId, 
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
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      console.log("🔥 نجاح! الطلب وصل لـ ID:", docRef.id);
      setOrderId(generatedOrderId);

      if (clearCart) clearCart(); 
      setStep(2); 
    } catch (err) {
      console.error("❌ فشل إرسال الطلب:", err);
      alert("الطلب لم يصل! السبب: " + err.message);
    }
    
    setLoading(false);
  };

  const inputClass = "w-full p-4 mb-4 bg-white text-black border-2 border-[#E8DDD0] rounded-xl focus:outline-none focus:border-[#C9A96E] font-bold text-lg transition-colors placeholder-gray-400";
  const whatsappMessage = `أهلاً Lemo Store، قمت بتسجيل طلب رقم #${orderId} باسم: ${formData.name} وأريد استكمال اللمسات الأخيرة لطلبي.\nالإجمالي: ${safeTotal} ج.م`;
  const whatsappLink = `https://wa.me/201009633100?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 font-sans" dir="rtl">
      <Navbar />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .checkout-layout { display: flex; gap: 2rem; flex-direction: row-reverse; align-items: flex-start; }
        .form-section, .summary-section { background: #fff; padding: 2rem; border-radius: 24px; border: 1px solid #E8DDD0; box-shadow: 0 5px 20px rgba(0,0,0,0.03); }
        .form-section { flex: 2; min-width: 300px; }
        .summary-section { flex: 1; min-width: 300px; position: sticky; top: 20px; }
        .success-box { background: #fff; padding: 4rem 2rem; border-radius: 24px; border: 1px solid #E8DDD0; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.05); animation: fadeIn 0.5s; }
        .whatsapp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; background: #25D366; color: #fff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 1.1rem; transition: 0.3s; box-shadow: 0 5px 20px rgba(37,211,102,0.3); }
        @media (max-width: 768px) {
          .checkout-layout { flex-direction: column; gap: 1.5rem; }
          .form-section, .summary-section { width: 100%; min-width: 100%; padding: 1.5rem; box-sizing: border-box; }
          .summary-section { position: static; } 
          .success-box { padding: 2rem 1rem; }
          .whatsapp-btn { width: 100%; box-sizing: border-box; font-size: 1rem; padding: 16px 20px; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto mt-8 px-6">
        {step === 1 && (
          <div className="checkout-layout">
            <div className="summary-section">
              <h3 className="text-[#3D2B1F] mb-6 text-center font-black text-xl">🛒 ملخص طلبك</h3>
              <div className="flex flex-col gap-3 text-sm">
                 {actualItems.map((item, idx) => (
                   <div key={idx} className="flex justify-between text-gray-700 font-bold pb-2 border-b border-dashed border-[#FAF8F5]">
                     <span className="flex-1 pl-2">{item.nameAr || item.name} (x{Number(item.quantity || item.qty) || 1})</span>
                     <span className="text-[#C9A96E] whitespace-nowrap">{(Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1)} ج.م</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="form-section">
               <h3 className="text-[#3D2B1F] mb-6 font-black text-xl">بيانات التوصيل</h3>
               <form onSubmit={handleOrder}>
                 <input placeholder="الاسم بالكامل" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} />
                 <input placeholder="01xxxxxxxxx" required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                 <textarea placeholder="العنوان بالتفصيل" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={`${inputClass} h-28`} />
                 <button type="submit" disabled={loading} className="w-full bg-[#C9A96E] text-white p-4 rounded-xl font-bold text-lg">
                   {loading ? "جاري الإرسال..." : "متابعة لتأكيد الطلب ➔"}
                 </button>
               </form>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="success-box">
            <h2 className="text-[#3D2B1F] mb-4 text-3xl font-black">تم تسجيل طلبك بنجاح!</h2>
            <h3 className="text-[#C9A96E] mb-6 text-2xl font-bold">رقم طلبك: #{orderId}</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-bold max-w-2xl mx-auto">
               يسعدنا تواصلك معنا، لتنسيق كافة التفاصيل وضمان أن طلبك سيكون تماماً كما تخيلته. تواصل معنا الآن لإتمام اللمسات الأخيرة لطلبك.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">💬 تواصل معنا عبر الواتساب</a>
          </div>
        )}
      </div>
    </div>
  );
}