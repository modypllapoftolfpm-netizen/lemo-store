import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { subscribeToAllOrders, updateOrderStatus } from "../../firebase/orders";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusAr = { pending: "معلق", processing: "جاري التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = subscribeToAllOrders(setOrders);
    return unsub;
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>📋 إدارة الطلبات</h1>
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          {orders.length === 0 && <p style={{ textAlign: "center", padding: "2rem", color: "#8B7355" }}>لا توجد طلبات بعد</p>}
          {orders.map((order) => (
            <div key={order.id} style={{ padding: "1.5rem", borderBottom: "1px solid #E8DDD0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#3D2B1F" }}>#{order.id.slice(-8)}</p>
                  <p style={{ margin: "0", color: "#8B7355", fontSize: "0.9rem" }}>{order.userName} — {order.userPhone}</p>
                  <p style={{ margin: "0", color: "#8B7355", fontSize: "0.9rem" }}>{order.address}</p>
                </div>
                <div style={{ textAlign: "end" }}>
                  <p style={{ margin: "0 0 8px", fontWeight: "700", color: "#C9A96E", fontSize: "1.1rem" }}>{order.total} ج.م</p>
                  <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{
                    padding: "6px 12px", borderRadius: "8px",
                    border: "1px solid #C9A96E", color: "#C9A96E",
                    fontWeight: "600", cursor: "pointer", outline: "none"
                  }}>
                    {statusOptions.map((s) => <option key={s} value={s}>{statusAr[s]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {order.items?.map((item, i) => (
                  <span key={i} style={{ background: "#FAF7F2", padding: "4px 10px", borderRadius: "8px", fontSize: "0.85rem", color: "#3D2B1F" }}>
                    {item.nameAr} × {item.qty}
                  </span>
                ))}
              </div>
              {order.fawryRef && <p style={{ margin: "8px 0 0", color: "#C9A96E", fontWeight: "600" }}>🏪 فوري: {order.fawryRef}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}