import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0
  });
  const [lastOrders, setLastOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const prodSnap = await getDocs(collection(db, "products"));
        const productsCount = prodSnap.size;

        const orderQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const orderSnap = await getDocs(orderQuery);
        
        const ordersCount = orderSnap.size;
        let earnings = 0;
        let pending = 0;
        let ordersList = [];

        const monthsNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const monthlyEarningsMap = {};

        const currentMonth = new Date().getMonth();
        for (let i = 4; i >= 0; i--) {
          const mIndex = (currentMonth - i + 12) % 12;
          monthlyEarningsMap[monthsNames[mIndex]] = 0;
        }

        orderSnap.forEach((doc) => {
          const data = doc.data();
          const totalPrice = Number(data.total) || Number(data.subtotal) || 0;
          const status = data.status || data.orderStatus || "pending";

          ordersList.push({
            id: doc.id.slice(0, 8) + "#",
            customer: data.userName || data.customerName || data.customer?.name || "عميل LEMO",
            price: totalPrice,
            status: status
          });

          if (status === "pending") pending++;
          if (status === "completed") {
            earnings += totalPrice;
            if (data.createdAt) {
              const orderDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
              const monthName = monthsNames[orderDate.getMonth()];
              if (monthlyEarningsMap[monthName] !== undefined) {
                monthlyEarningsMap[monthName] += totalPrice;
              }
            }
          }
        });

        const formattedChartData = Object.keys(monthlyEarningsMap).map(month => ({
          name: month,
          sales: monthlyEarningsMap[month]
        }));

        setStats({
          totalProducts: productsCount,
          totalOrders: ordersCount,
          totalEarnings: earnings,
          pendingOrders: pending
        });

        setLastOrders(ordersList.slice(0, 5));
        setChartData(formattedChartData);

      } catch (e) {
        console.error("Error fetching dashboard:", e);
      }
      setLoading(false);
    }
    
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF8F5" }} dir="rtl">
        <Navbar />
        <div style={{ padding: "10rem 2rem", color: "#8B7355", textAlign: "center", fontSize: "1.2rem", fontWeight: "600" }}>
          ⏳ جاري تحميل لوحة تحكم Lemo Store...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        
        <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "2rem" }}>📊</span>
          <div>
            <h1 style={{ color: "#111", margin: 0, fontSize: "1.8rem", fontWeight: "900" }}>لوحة تحكم Lemo Store</h1>
            <p style={{ margin: "5px 0 0", color: "#8B7355", fontSize: "0.95rem" }}>مركز إدارة المتجر والمبيعات</p>
          </div>
        </div>

        {/* كروت الإحصائيات */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #E8DDD0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📦</div>
            <div style={{ color: "#8B7355", fontSize: "0.9rem", fontWeight: "600" }}>إجمالي المنتجات</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#3D2B1F", marginTop: "4px" }}>{stats.totalProducts}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #E8DDD0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
            <div style={{ color: "#8B7355", fontSize: "0.9rem", fontWeight: "600" }}>إجمالي الطلبات</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#3D2B1F", marginTop: "4px" }}>{stats.totalOrders}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #E8DDD0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💰</div>
            <div style={{ color: "#8B7355", fontSize: "0.9rem", fontWeight: "600" }}>الإيرادات المكتملة</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#3D2B1F", marginTop: "4px" }}>{stats.totalEarnings} ج.م</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #E8DDD0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏳</div>
            <div style={{ color: "#8B7355", fontSize: "0.9rem", fontWeight: "600" }}>طلبات بانتظار الشحن</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#C9A96E", marginTop: "4px" }}>{stats.pendingOrders}</div>
          </div>
        </div>

        {/* أزرار التنقل */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.2rem", marginBottom: "3rem" }}>
          <Link to="/admin/products" style={navButtonStyle}>
            <span style={{ fontSize: "1.8rem" }}>📦</span> المنتجات
          </Link>
          <Link to="/admin/orders" style={navButtonStyle}>
            <span style={{ fontSize: "1.8rem" }}>📋</span> الطلبات
          </Link>
          <Link to="/admin/categories" style={navButtonStyle}>
            <span style={{ fontSize: "1.8rem" }}>🗂️</span> الفئات
          </Link>
          <Link to="/admin/banners" style={navButtonStyle}>
            <span style={{ fontSize: "1.8rem" }}>🖼️</span> البانرات
          </Link>
          <Link to="/admin/coupons" style={{...navButtonStyle, background: "#C9A96E"}}>
            <span style={{ fontSize: "1.8rem" }}>🎟️</span> الكوبونات
          </Link>
          <Link to="/adminsettings" style={{...navButtonStyle, background: "#111"}}>
            <span style={{ fontSize: "1.8rem" }}>⚙️</span> الإعدادات
          </Link>
        </div>

        {/* الرسم البياني */}
        <div style={{ background: "#fff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>📈</span>
            <h3 style={{ color: "#3D2B1F", margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>تحليلات المبيعات (مكتملة)</h3>
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" stroke="#8B7355" style={{ fontSize: "12px", fontFamily: "Cairo" }} />
                <YAxis stroke="#8B7355" style={{ fontSize: "12px", fontFamily: "Cairo" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", fontFamily: "Cairo", textAlign: "right" }} />
                <Area type="monotone" dataKey="sales" stroke="#C9A96E" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* جدول آخر 5 طلبات */}
        <div style={{ background: "#fff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.3rem" }}>🛒</span>
              <h3 style={{ color: "#3D2B1F", margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>أحدث الطلبات</h3>
            </div>
            <Link to="/admin/orders" style={{ color: "#C9A96E", fontWeight: "bold", textDecoration: "none", fontSize: "0.9rem" }}>عرض الكل ←</Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "right", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAF7F2", color: "#8B7355", fontSize: "0.9rem" }}>
                  <th style={{ padding: "15px", borderRadius: "0 10px 10px 0" }}>رقم الطلب</th>
                  <th style={{ padding: "15px" }}>العميل</th>
                  <th style={{ padding: "15px" }}>القيمة</th>
                  <th style={{ padding: "15px", borderRadius: "10px 0 0 0" }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {lastOrders.map((order, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #FAF7F2" }}>
                    <td style={{ padding: "15px", fontWeight: "bold", color: "#111" }}>{order.id}</td>
                    <td style={{ padding: "15px", color: "#666" }}>{order.customer}</td>
                    <td style={{ padding: "15px", color: "#3D2B1F", fontWeight: "800" }}>{order.price} ج.م</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ background: order.status === "completed" ? "#E8F5E9" : "#FFF0F0", color: order.status === "completed" ? "#2E7D32" : "#FF4D4D", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
                        {order.status === "completed" ? "مكتمل" : "بانتظار الشحن"}
                      </span>
                    </td>
                  </tr>
                ))}
                {lastOrders.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>لا توجد طلبات حديثة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

const navButtonStyle = {
  textDecoration: "none", 
  background: "#3D2B1F", 
  color: "#fff", 
  padding: "1.2rem", 
  borderRadius: "16px", 
  textAlign: "center", 
  fontWeight: "700", 
  display: "flex", 
  flexDirection: "column", 
  alignItems: "center", 
  gap: "8px", 
  transition: "0.2s",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
};