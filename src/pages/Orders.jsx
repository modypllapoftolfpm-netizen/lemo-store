import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { subscribeToUserOrders } from "../firebase/orders";

export default function Orders() {
  const { user } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserOrders(user.uid, setOrders);
    return unsub;
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>📋 {t.orders.title}</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem" }}>📦</div>
            <p style={{ color: "#8B7355" }}>{t.orders.empty}</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.id} style={{
            background: "#fff", borderRadius: "16px", padding: "1.5rem",
            marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#3D2B1F" }}>طلب #{order.id.slice(-8)}</p>
                <p style={{ margin: "0", color: "#8B7355", fontSize: "0.9rem" }}>
                  {order.createdAt?.toDate?.()?.toLocaleDateString("ar-EG") || ""}
                </p>
              </div>
              <div style={{ textAlign: "end" }}>
                <span style={{
                  background: "#FFF8F0", color: "#C9A96E",
                  padding: "4px 12px", borderRadius: "20px", fontWeight: "600", fontSize: "0.9rem"
                }}>{t.orders.status[order.orderStatus] || order.orderStatus}</span>
                <p style={{ margin: "4px 0 0", fontWeight: "700", color: "#C9A96E" }}>{order.total} {t.currency}</p>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #E8DDD0", marginTop: "1rem", paddingTop: "1rem" }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "4px" }}>
                  <span style={{ color: "#3D2B1F" }}>{item.nameAr} × {item.qty}</span>
                  <span style={{ color: "#C9A96E" }}>{item.price * item.qty} {t.currency}</span>
                </div>
              ))}
            </div>
            {order.fawryRef && (
              <div style={{ background: "#FFF8F0", borderRadius: "10px", padding: "10px", marginTop: "10px" }}>
                <p style={{ margin: 0, color: "#C9A96E", fontWeight: "700" }}>🏪 كود فوري: {order.fawryRef}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}