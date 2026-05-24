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
        paymentMethod: "contact_vendor",
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

  // شاشة نجاح أنيقة ودافئة (Minimalist Style)
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white px-8 py-12 rounded-3xl shadow-sm border border-lemo-beige/40 text-center animate-fadeUp">
        <div className="w-16 h-16 bg-lemo-cream rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-lemo-muted">✓</span>
        </div>
        <h2 className="text-3xl font-display text-lemo-dark font-normal mb-3 tracking-wide">
          {isRTL ? "تمت مراجعة طلبك" : "Order Received"}
        </h2>
        <p className="text-sm text-lemo-muted font-sans tracking-widest mb-2 uppercase">
          {isRTL ? `رقم الأوردر: #${lastOrderId.substring(0,6)}` : `Order Number: #${lastOrderId.substring(0,6)}`}
        </p>
        
        <div className="bg-lemo-cream/40 p-6 rounded-2xl border border-lemo-beige/50 my-8 text-lemo-text max-w-md mx-auto">
          <p className="font-display text-base text-lemo-dark mb-4 leading-relaxed">
            {isRTL 
              ? "لأن شموعنا تُصنع يدوياً وبكل حب خصيصاً لك، يرجى الضغط أدناه للتواصل معنا لتأكيد أي تعديلات مخصصة (الروائح، الألوان، أو العبارات):" 
              : "Since our candles are thoughtfully handcrafted just for you, please contact us below to confirm custom details (scents, colors, or lettering):"}
          </p>
          <a 
            href="https://wa.me/201009633100" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center justify-center gap-2 bg-lemo-dark text-white px-8 py-3.5 rounded-full text-sm font-medium tracking-wider hover:bg-lemo-gold transition-all duration-300 w-full shadow-sm"
          >
            <span>💬 WhatsApp: 01009633100</span>
          </a>
        </div>

        <button 
          onClick={() => window.location.href = "/"} 
          className="text-sm text-lemo-muted hover:text-lemo-dark underline underline-offset-4 font-medium transition-colors"
        >
          {isRTL ? "متابعة التسوق للمزيد" : "Continue Shopping"}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl max-w-md mx-auto my-12 border border-lemo-beige/20 animate-fadeUp px-6">
        <p className="font-display text-xl text-lemo-dark mb-2">{t.cart.empty}</p>
        <p className="text-sm text-lemo-muted mb-8">{t.cart.emptyDesc}</p>
        <button onClick={() => window.location.href = "/"} className="btn-outline text-sm px-8 py-2.5">
          {t.cart.continueShopping}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-fadeUp">
      {/* عنوان علوي هادئ وبسيط على ستايل الشموع الاسكندنافية */}
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl text-lemo-dark font-normal tracking-wide lowercase">
          {isRTL ? "تفاصيل طلبك" : "checkout"}
        </h1>
        <div className="w-12 h-[1px] bg-lemo-nude mx-auto mt-3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* استمارة البيانات الشفيفة والأنيقة */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-lemo-beige/30 flex flex-col gap-6">
          <h2 className="font-display text-lg text-lemo-dark tracking-wide font-medium border-b border-lemo-cream pb-3">
            {t.checkout.personalInfo}
          </h2>

          {error && <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-lemo-muted uppercase tracking-wider mb-1.5">{t.checkout.name} *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-lemo-beige/60 focus:outline-none focus:border-lemo-nude bg-lemo-cream/20 text-sm transition-colors text-lemo-dark"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-lemo-muted uppercase tracking-wider mb-1.5">{t.checkout.phone} *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-lemo-beige/60 focus:outline-none focus:border-lemo-nude bg-lemo-cream/20 text-sm transition-colors text-lemo-dark"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-lemo-muted uppercase tracking-wider mb-1.5">{t.checkout.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-lemo-beige/60 focus:outline-none focus:border-lemo-nude bg-lemo-cream/20 text-sm transition-colors text-lemo-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-lemo-muted uppercase tracking-wider mb-1.5">{t.checkout.address} *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-lemo-beige/60 focus:outline-none focus:border-lemo-nude bg-lemo-cream/20 text-sm transition-colors text-lemo-dark resize-none"
              required
            />
          </div>

          <div className="bg-lemo-cream/40 border border-lemo-beige/60 p-4 rounded-xl text-xs text-lemo-muted leading-relaxed">
            ✨ {isRTL 
              ? "ملحوظة: بمجرد إرسال طلبك، سنقوم بالتواصل معك مباشرة لمراجعة التخصيص اليدوي للشموع وضمان تنفيذها بدقة." 
              : "Note: Upon clicking place order, you can initiate a WhatsApp chat with us to review custom candle adjustments."}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lemo-dark text-white py-3.5 rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-lemo-gold hover:shadow-sm active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? t.loading : t.checkout.placeOrder}
          </button>
        </form>

        {/* كارت ملخص المنتجات المستوحى من تفاصيل Bohouse */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-lemo-beige/30 h-fit sticky top-28">
          <h2 className="font-display text-lg text-lemo-dark tracking-wide font-medium border-b border-lemo-cream pb-3 mb-4">
            {t.cart.title}
          </h2>
          
          <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm border-b border-lemo-cream/50 pb-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-lemo-cream flex-shrink-0 border border-lemo-beige/20">
                    <img src={item.imageUrl} alt={item.nameAr} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-lemo-dark line-clamp-1 font-medium">{isRTL ? item.nameAr : item.nameEn}</p>
                    <p className="text-xs text-lemo-muted mt-0.5">qty: {item.qty}</p>
                  </div>
                </div>
                <span className="font-medium text-lemo-text">{item.price * item.qty} {t.currency}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2 text-sm text-lemo-muted">
            <div className="flex justify-between">
              <span className="font-sans text-xs uppercase tracking-wider">{t.cart.subtotal}</span>
              <span className="text-lemo-dark font-medium">{subtotal} {t.currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="font-sans text-xs uppercase tracking-wider">{t.cart.discount}</span>
                <span className="font-medium">-{discount} {t.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-medium text-lemo-dark pt-3 border-t border-dashed border-lemo-beige mt-2">
              <span className="font-display tracking-wide">{t.cart.total}</span>
              <span className="font-bold text-lg">{total} {t.currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;