import React, { useState } from "react";
import Navbar from "../components/layout/Navbar"; // تأكد إن مسار النافبار صح

export default function Checkout() {
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا ممكن تضيف كود الفايربيز (Firebase) مستقبلاً عشان تحفظ الطلب في الداتابيز
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <Navbar />
      
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div style={{ 
          background: "#fff", 
          padding: "3rem 2.5rem", 
          borderRadius: "20px", 
          border: "1px solid #E8DDD0", 
          boxShadow: "0 10px 40px rgba(201,169,110,0.08)" 
        }}>
          
          {!isSubmitted ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <h2 style={{ color: "#3D2B1F", fontSize: "1.9rem", fontWeight: "800", marginBottom: "0.5rem" }}>
                  إتمام الطلب 🕯️
                </h2>
                <p style={{ color: "#8B7355", fontSize: "1rem", fontWeight: "600" }}>
                  يرجى إدخال بياناتك لتسجيل طلبك المبدئي
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* حقل الاسم */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#3D2B1F", fontWeight: "700", fontSize: "0.95rem" }}>الاسم بالكامل</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    style={{
                      width: "100%", padding: "14px", borderRadius: "12px",
                      border: "2px solid #F0E8DF", background: "#FCFAFC",
                      fontSize: "1rem", color: "#3D2B1F", outline: "none", transition: "0.3s", boxSizing: "border-box"
                    }} 
                    onFocus={(e) => e.target.style.borderColor = "#C9A96E"}
                    onBlur={(e) => e.target.style.borderColor = "#F0E8DF"}
                    placeholder="أدخل اسمك الكريم"
                  />
                </div>

                {/* حقل رقم الهاتف */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#3D2B1F", fontWeight: "700", fontSize: "0.95rem" }}>رقم الهاتف (للتواصل)</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleChange} 
                    style={{
                      width: "100%", padding: "14px", borderRadius: "12px",
                      border: "2px solid #F0E8DF", background: "#FCFAFC",
                      fontSize: "1rem", color: "#3D2B1F", outline: "none", transition: "0.3s", boxSizing: "border-box", textAlign: "right"
                    }} 
                    onFocus={(e) => e.target.style.borderColor = "#C9A96E"}
                    onBlur={(e) => e.target.style.borderColor = "#F0E8DF"}
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                {/* حقل العنوان */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#3D2B1F", fontWeight: "700", fontSize: "0.95rem" }}>عنوان التوصيل بالتفصيل</label>
                  <textarea 
                    name="address" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    rows="3"
                    style={{
                      width: "100%", padding: "14px", borderRadius: "12px",
                      border: "2px solid #F0E8DF", background: "#FCFAFC",
                      fontSize: "1rem", color: "#3D2B1F", outline: "none", resize: "none", transition: "0.3s", boxSizing: "border-box"
                    }} 
                    onFocus={(e) => e.target.style.borderColor = "#C9A96E"}
                    onBlur={(e) => e.target.style.borderColor = "#F0E8DF"}
                    placeholder="المحافظة، المدينة، اسم الشارع، رقم العمارة..."
                  />
                </div>

                {/* زر الإرسال */}
                <button type="submit" style={{
                  background: "linear-gradient(135deg, #C9A96E, #b8925a)",
                  color: "#fff", padding: "16px", borderRadius: "12px",
                  border: "none", fontSize: "1.15rem", fontWeight: "bold",
                  cursor: "pointer", marginTop: "1rem", transition: "transform 0.3s, boxShadow 0.3s",
                  boxShadow: "0 6px 20px rgba(201,169,110,0.3)"
                }}
                onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 25px rgba(201,169,110,0.4)"; }}
                onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 6px 20px rgba(201,169,110,0.3)"; }}
                >
                  تأكيد الطلب المبدئي
                </button>
              </form>
            </>
          ) : (
            /* رسالة النجاح الراقية بعد إتمام الطلب */
            <div style={{ textAlign: "center", padding: "1rem 0", animation: "fadeIn 0.5s ease-in-out" }}>
              <div style={{ fontSize: "4.5rem", marginBottom: "1rem" }}>✨</div>
              <h2 style={{ color: "#3D2B1F", marginBottom: "1rem", fontSize: "1.8rem", fontWeight: "800" }}>
                خطوة واحدة وتكتمل تحفتك الفنية!
              </h2>
              <div style={{ width: "60px", height: "3px", background: "#C9A96E", margin: "0 auto 1.5rem", borderRadius: "2px" }}></div>
              <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "2.5rem", fontWeight: "600" }}>
                في <span style={{ color: "#3D2B1F", fontWeight: "800" }}>LEMO</span>، نحن لا نبيع منتجات جاهزة، بل نصنع بحب قطعاً تعكس روح مساحتك الخاصة. 
                يرجى التواصل معنا الآن لنضع معاً اللمسات الأخيرة، ونختار <span style={{ color: "#C9A96E", fontWeight: "bold" }}> العطر الذي يريحك، والتفاصيل والألوان التي تشبهك.</span>
              </p>
              
              <a href={`https://wa.me/201009633100?text=أهلاً LEMO، قمت بتسجيل طلب باسم: ${formData.name} وأريد اختيار تفاصيل العطر والشكل لقطعتي الخاصة.`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{
                   display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                   background: "#25D366", color: "#fff", padding: "15px 30px", borderRadius: "50px",
                   textDecoration: "none", fontSize: "1.15rem", fontWeight: "bold",
                   boxShadow: "0 6px 20px rgba(37,211,102,0.3)", transition: "0.3s"
                 }}
                 onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                 onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                 >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                 </svg>
                 تواصل معنا الآن عبر الواتساب
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}