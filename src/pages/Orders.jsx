import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Navbar from "../components/layout/Navbar";
import { Link } from "react-router-dom";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  // خطوات حالة الطلب للتصميم الجديد
  const steps = [
    { id: "pending", label: "تم الاستلام 📦" },
    { id: "processing", label: "جاري التجهيز ⏳" },
    { id: "shipped", label: "في الطريق 🚚" },
    { id: "delivered", label: "تم التوصيل ✅" }
  ];

  const getStepIndex = (status) => {
    const index = steps.findIndex(s => s.id === status);
    return index >= 0 ? index : 0;
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#FAF8F5" }}><Navbar /><div style={{ textAlign: "center", padding: "5rem", color: "#C9A96E", fontWeight: "bold", fontSize: "1.2rem" }}>جاري تحميل طلباتك...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1.5rem" }}>
        <h2 style={{ color: "#3D2B1F", marginBottom: "2rem", borderBottom: "2px solid #E8DDD0", paddingBottom: "10px", fontWeight: "900" }}>📦 طلباتي السابقة</h2>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "15px", border: "1px solid #E8DDD0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛍️</div>
            <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem", fontWeight: "600" }}>لم تقم بأي طلبات حتى الآن.</p>
            <Link to="/products" style={{ background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "12px 35px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", boxShadow: "0 4px 15px rgba(201,169,110,0.3)" }}>
              ابدأ التسوق الآن
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {orders.map(order => {
              const currentStep = getStepIndex(order.status || "pending");
              
              // تأمين عرض السعر عشان لو الطلب قديم ومتسجلش فيه سعر يكتب 0 بدل ما يسيبها فاضية
              const orderTotal = Number(order.total) || Number(order.subtotal) || 0;

              return (
                <div key={order.id} style={{ background: "#fff", padding: "2rem", borderRadius: "16px", border: "1px solid #E8DDD0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px dashed #E8DDD0", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <span style={{ color: "#8B7355", fontSize: "1rem", fontWeight: "bold" }}>رقم الطلب: #{order.id.slice(0, 8).toUpperCase()}</span>
                      <div style={{ color: "#3D2B1F", fontWeight: "900", marginTop: "8px", fontSize: "1.3rem" }}>
                        الإجمالي: <span style={{ color: "#C9A96E" }}>{orderTotal} ج.م</span>
                      </div>
                    </div>
                    <div style={{ color: "#666", fontSize: "0.95rem", fontWeight: "700", background: "#FAF8F5", padding: "10px 15px", borderRadius: "8px", border: "1px solid #E8DDD0" }}>
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : "طلب حديث"}
                    </div>
                  </div>

                  {/* شريط التتبع (Timeline) */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", marginTop: "2.5rem", padding: "0 1rem", overflowX: "auto" }}>
                    <div style={{ position: "absolute", top: "15px", right: "0", left: "0", height: "4px", background: "#F0E8DF", zIndex: 1, margin: "0 2.5rem" }}></div>
                    <div style={{ position: "absolute", top: "15px", right: "0", width: `${(currentStep / (steps.length - 1)) * 100}%`, height: "4px", background: "linear-gradient(135deg, #C9A96E, #b8925a)", zIndex: 2, margin: "0 2.5rem", transition: "width 0.6s ease-in-out" }}></div>
                    
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStep;
                      return (
                        <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, position: "relative", minWidth: "90px" }}>
                          <div style={{ 
                            width: "35px", height: "35px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", 
                            background: isCompleted ? "linear-gradient(135deg, #C9A96E, #b8925a)" : "#fff", 
                            border: `3px solid ${isCompleted ? "#C9A96E" : "#E8DDD0"}`, 
                            color: isCompleted ? "#fff" : "#C9A96E", fontWeight: "bold", fontSize: "1.1rem", transition: "0.4s" 
                          }}>
                            {isCompleted ? "✓" : index + 1}
                          </div>
                          <span style={{ marginTop: "12px", fontSize: "0.85rem", fontWeight: "bold", color: isCompleted ? "#3D2B1F" : "#A89A8E", textAlign: "center" }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}