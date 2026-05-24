import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../firebase/orders";

const CheckoutPage = () => {
  const { items, subtotal, getTotal, clearCart } = useCart();
  const { t, isRTL } = useLang();
  const { user, profile } = useAuth();

  const { discount, total } = getTotal(0);

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setError(isRTL ? "برجاء ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        userId: user?.uid || "guest",
        userEmail: formData.email,
        userName: formData.name,
        userPhone: formData.phone,
        address: formData.address,
        items: items.map((i) => ({
          productId: i.id,
          nameAr: i.nameAr,
          nameEn: i.nameEn,
          price: i.price,
          qty: i.qty,
          imageUrl: i.imageUrl,
        })),
        subtotal,
        discount,
        total,
        promoCode: null,
        paymentMethod: "contact_vendor", // نظام مخصص للتواصل المباشر
        paymentStatus: "pending",
        fawryRef: null,
        paymobOrderId: null,
      };

      const docRef = await createOrder(orderData);
      setLastOrderId(docRef.id);
      clearCart();
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  // شاشة نجاح الطلب مع رسالة التوجيه للرقم الخاص بك
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-2xl shadow-md border border-lemo-beige/40 text-center animate-fadeUp">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-display text-lemo-dark font-bold mb-3">
          {isRTL ? "تم تسجيل طلبك بنجاح!" : "Order Placed Successfully!"}
        </h2>
        <p className="text-sm text-lemo-muted mb-2">
          {isRTL ? `رقم الطلب: #${lastOrderId}` : `Order ID: #${lastOrderId}`}
        </p>
        
        <div className="bg-lemo-cream/60 p-4 rounded-xl border border-lemo-gold/30 my-6 text-lemo-text">
          <p className="font-medium text-base mb-2">
            {isRTL 
              ? "برجاء التواصل على هذا الرقم لاستكمال طلبك وتأكيد التعديلات المخصصة للشموع:" 
              : "Please contact us at this number to complete your order and confirm custom candle details:"}
          </p>
          <a 
            href="https://wa.me/201009633100" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xl font-bold text-lemo-dark hover:text-lemo-gold block transition-colors mt-2 tracking-wide"
          >
            📞 01009633100
          </a>
          <span className="text-xs text-lemo-muted block mt-1">
            {isRTL ? "(اضغط على الرقم لفتح واتساب مباشرة)" : "(Click the number to open WhatsApp directly)"}
          </span>
        </div>

        <button 
          onClick={() => window.location.href = "/"} 
          className="btn-primary text-sm py-2 px-6"
        >
          {isRTL ? "العودة للرئيسية" : "Back to Home"}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl p-8 max-w-md mx-auto my-10 border border-lemo-beige/30 animate-fadeUp">
        <p className="text-lemo-muted text-lg mb-4">{t.cart.empty}</p>
        <p className="text-sm text-lemo-muted mb-6">{t.cart.emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fadeUp">
      <h1 className="section-title">{t.checkout.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* استمارة البيانات */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-lemo-beige/20 flex flex-col gap-4">
          <h2 className="text-xl font-display text-lemo-dark border-b border-lemo-cream pb-2 font-semibold">
            {t.checkout.personalInfo}
          </h2>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-lemo-muted mb-1">{t.checkout.name} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-lemo-beige focus:outline-none focus:border-lemo-gold bg-lemo-cream/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lemo-muted mb-1">{t.checkout.phone} *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-lemo-beige focus:outline-none focus:border-lemo-gold bg-lemo-cream/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lemo-muted mb-1">{t.checkout.address} *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-lemo-beige focus:outline-none focus:border-lemo-gold bg-lemo-cream/30"
              required
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mt-2 line-height-relaxed">
            💡 {isRTL 
              ? "بعد الضغط على تأكيد الطلب، سيظهر لك رقم الهاتف للتواصل معنا وتأكيد أي تعديلات خاصة بالشموع والديكور." 
              : "After placing the order, our phone number will be displayed to confirm any customization regarding candles and decor."}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? t.loading : t.checkout.placeOrder}
          </button>
        </form>

        {/* ملخص الطلب */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-lemo-beige/20 h-fit">
          <h2 className="text-xl font-display text-lemo-dark border-b border-lemo-cream pb-2 mb-4 font-semibold">
            {t.cart.title}
          </h2>
          
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-4 pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm border-b border-lemo-cream pb-2">
                <div className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.nameAr} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-lemo-dark line-clamp-1">{isRTL ? item.nameAr : item.nameEn}</p>
                    <p className="text-xs text-lemo-muted">x{item.qty}</p>
                  </div>
                </div>
                <span className="font-semibold text-lemo-text">{item.price * item.qty} {t.currency}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-lemo-beige/30 text-sm">
            <div className="flex justify-between text-lemo-muted">
              <span>{t.cart.subtotal}</span>
              <span>{subtotal} {t.currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t.cart.discount}</span>
                <span>-{discount} {t.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-lemo-dark pt-2 border-t border-dashed border-lemo-beige">
              <span>{t.cart.total}</span>
              <span>{total} {t.currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;