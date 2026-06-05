import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { getAllOrders, updateOrderStatus } from "../../firebase/orders"; // شلنا subscribeToAllOrders

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusAr = { pending: "معلق", processing: "جاري التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة تحميل البيانات
  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem", fontWeight: "900" }}>📋 إدارة الطلبات</h1>
        
        <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "3rem" }}>جاري التحميل...</p>
          ) : orders.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem" }}>لا توجد طلبات</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} style={{ padding: "1.5rem", borderBottom: "1px solid #E8DDD0" }}>
                <p style={{ fontWeight: "900", color: "#3D2B1F" }}>طلب رقم: #{order.orderId || order.id.slice(-8).toUpperCase()}</p>
                <select 
                  value={order.orderStatus || order.status || "pending"} 
                  onChange={async (e) => {
                    await updateOrderStatus(order.id, e.target.value);
                    loadOrders(); // تحديث القائمة بعد التغيير
                  }}
                  style={{ padding: "8px", borderRadius: "8px" }}
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{statusAr[s]}</option>)}
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}