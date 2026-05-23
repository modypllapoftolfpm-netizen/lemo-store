import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { subscribeToProducts } from "../../firebase/products";
import { subscribeToAllOrders } from "../../firebase/orders";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const u1 = subscribeToProducts(setProducts);
    const u2 = subscribeToAllOrders(setOrders);
    return () => { u1(); u2(); };
  }, []);

  const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "إجمالي المنتجات", value: products.length, icon: "📦", link: "/admin/products" },
    { label: "إجمالي الطلبات", value: orders.length, icon: "📋", link: "/admin/orders" },
    { label: "إجمالي الإيرادات", value: `${totalRevenue} ج.م`, icon: "💰", link: "/admin/orders" },
    { label: "طلبات معلقة", value: orders.filter(o => o.orderStatus === "pending").length, icon: "⏳", link: "/admin/orders" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>📊 لوحة التحكم</h1>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {stats.map((s) => (
            <Link key={s.label} to={s.link} style={{ textDecoration: "none", flex: "1", minWidth: "180px" }}>
              <div style={{
                background: "#fff", borderRadius: "16px", padding: "1.5rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "center",
                transition: "transform 0.2s", cursor: "pointer"
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#C9A96E" }}>{s.value}</div>
                <div style={{ color: "#8B7355", fontSize: "0.9rem" }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { to: "/admin/products", icon: "📦", label: "إدارة المنتجات" },
            { to: "/admin/orders", icon: "📋", label: "إدارة الطلبات" },
            { to: "/admin/banners", icon: "🖼️", label: "البانرات" },
            { to: "/admin/settings", icon: "⚙️", label: "الإعدادات" },
          ].map((link) => (
            <Link key={link.to} to={link.to} style={{
              textDecoration: "none", flex: "1", minWidth: "180px",
              background: "#3D2B1F", color: "#fff", borderRadius: "16px",
              padding: "1.2rem", textAlign: "center", fontWeight: "700", fontSize: "1rem"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{link.icon}</div>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ marginTop: "2rem", background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#3D2B1F", marginBottom: "1rem" }}>آخر الطلبات</h2>
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E8DDD0" }}>
              <span style={{ color: "#3D2B1F" }}>#{order.id.slice(-8)}</span>
              <span style={{ color: "#8B7355" }}>{order.userName}</span>
              <span style={{ color: "#C9A96E", fontWeight: "700" }}>{order.total} ج.م</span>
              <span style={{ background: "#FFF8F0", color: "#C9A96E", padding: "2px 10px", borderRadius: "10px", fontSize: "0.85rem" }}>{order.orderStatus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}