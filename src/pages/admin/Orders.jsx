import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { subscribeToAllOrders, updateOrderStatus } from "../../firebase/orders";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusAr = { pending: "معلق", processing: "جاري التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // تشغيل الاشتراك مرة واحدة فقط عند فتح الصفحة لضمان استقرار الداتا
    const unsub = subscribeToAllOrders((data) => {
      console.log("🔥 الداتا المستلمة:", data);
      if (data) {
        setOrders(data);
      }
    });

    // الـ cleanup يضمن إغلاق الاتصال عند مغادرة الصفحة
    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, []); 

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem", fontWeight: "900" }}>📋 إدارة الطلبات</h1>
        
        <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0" }}>
          {(!orders || orders.length === 0) && (
            <p style={{ textAlign: "center", padding: "3rem", color: "#8B7355", fontSize: "1.2rem", fontWeight: "bold" }}>لا توجد طلبات بعد</p>
          )}
          
          {orders && orders.map((order) => {
            const orderTotal = Number(order.total) || Number(order.subtotal) || 0;
            const currentStatus = order.orderStatus || order.status || "pending";
            
            return (
              <div key={order.id} style={{ padding: "1.5rem", borderBottom: "1px solid #E8DDD0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
                  
                  {/* بيانات العميل - يعرض الـ ID الموحد */}
                  <div>
                    <p style={{ margin: "0 0 8px", fontWeight: "900", color: "#3D2B1F", fontSize: "1.1rem" }}>
                      طلب رقم: #{order.orderId || order.id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ margin: "0 0 4px", color: "#555", fontSize: "1rem", fontWeight: "bold" }}>
                      👤 {order.userName || order.name || order.customerName || "بدون اسم"} — 📞 <span dir="ltr">{order.userPhone || order.phone || order.customerPhone || "بدون رقم"}</span>
                    </p>
                    <p style={{ margin: "0", color: "#8B7355", fontSize: "0.95rem" }}>
                      📍 {order.address || order.shippingAddress || "بدون عنوان"}
                    </p>
                    {order.createdAt && order.createdAt.toDate && (
                      <p style={{ margin: "4px 0 0", color: "#A89A8E", fontSize: "0.85rem" }}>
                        🕒 {order.createdAt.toDate().toLocaleString('ar-EG')}
                      </p>
                    )}
                  </div>

                  {/* الإجمالي وتغيير الحالة */}
                  <div style={{ textAlign: "left", minWidth: "150px" }}>
                    <p style={{ margin: "0 0 10px", fontWeight: "900", color: "#C9A96E", fontSize: "1.3rem" }}>
                      {orderTotal} ج.م
                    </p>
                    <select 
                      value={currentStatus} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)} 
                      style={{
                        width: "100%", padding: "8px 12px", borderRadius: "10px",
                        border: "2px solid #F0E8DF", background: "#FCFAFC", color: "#3D2B1F",
                        fontWeight: "bold", cursor: "pointer", outline: "none", transition: "0.3s"
                      }}
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{statusAr[s]}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", background: "#FAF8F5", padding: "15px", borderRadius: "12px" }}>
                  {order.items?.map((item, i) => (
                    <span key={i} style={{ background: "#fff", padding: "6px 15px", borderRadius: "8px", fontSize: "0.95rem", color: "#3D2B1F", fontWeight: "bold", border: "1px solid #E8DDD0", display: "flex", alignItems: "center", gap: "8px" }}>
                      {item.nameAr || item.name || "منتج"} <span style={{ color: "#C9A96E" }}>× {item.qty || item.quantity || 1}</span>
                    </span>
                  ))}
                </div>
                
                {order.fawryRef && <p style={{ margin: "10px 0 0", color: "#C9A96E", fontWeight: "bold", background: "#FCFAFC", padding: "8px", borderRadius: "8px", display: "inline-block" }}>🏪 كود فوري: {order.fawryRef}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}