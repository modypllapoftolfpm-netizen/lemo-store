import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
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
    async function fetchRealDashboardData() {
      try {
        // ─── خطوة التنظيف التلقائي للطلبات الوهمية القديمة (0 ج.م) ───
        const checkOrdersSnap = await getDocs(collection(db, "orders"));
        for (const orderDoc of checkOrdersSnap.docs) {
          const orderData = orderDoc.data();
          // لو الطلب إيراداته 0 ج.م أو من أسماء التجارب المسجلة، يطير فوراً على نظافة
          if (Number(orderData.totalPrice) === 0 || orderDoc.id === "TPs5Bzki" || orderDoc.id === "98rbJIlf" || orderDoc.id === "RSXNQvRV") {
            await deleteDoc(doc(db, "orders", orderDoc.id));
          }
        }

        // 1) جلب المنتجات الحقيقية
        const prodSnap = await getDocs(collection(db, "products"));
        const productsCount = prodSnap.size;

        // 2) جلب الطلبات الحقيقية المتبقية بعد التنظيف
        const orderQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const orderSnap = await getDocs(orderQuery);
        
        const ordersCount = orderSnap.size;
        let earnings = 0;
        let pending = 0;
        let ordersList = [];

        const monthsNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const monthlyEarningsMap = {};

        // تهيئة الـ 5 أشهر الأخيرة بقيم صفرية لضمان ثبات الرسم البياني
        const currentMonth = new Date().getMonth();
        for (let i = 4; i >= 0; i--) {
          const mIndex = (currentMonth - i + 12) % 12;
          monthlyEarningsMap[monthsNames[mIndex]] = 0;
        }

        orderSnap.forEach((doc) => {
          const data = doc.data();
          const totalPrice = Number(data.totalPrice) || 0;
          const status = data.status || "pending";

          ordersList.push({
            id: doc.id.slice(0, 8) + "#",
            customer: data.customerName || data.customer?.name || "عميل LEMO",
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
        console.error("Error calculations stats flow:", e);
      }
      setLoading(false);
    }
    
    fetchRealDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF8F5" }} dir="rtl">
        <Navbar />
        <div style={{ padding: "10rem 2rem", color: "#8B7355", textAlign: "center", fontSize: "1.2rem", fontWeight: "600" }}>
          ⏳ جاري تنظيف الطلبات الوهمية وتحديث الإحصائيات الحقيقية...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.8rem" }}>📊</span>
          <h1 style={{ color: "#111", margin: 0, fontSize: "1.8rem", fontWeight: "800" }}>لوحة التحكم الحية</h1>
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
            <div style={{ color: "#8B7355", fontSize: "0.9rem", fontWeight: "600" }}>إجمالي الإيرادات (المكتملة)</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#3D2B1F", marginTop: "4px" }}>{stats.totalEarnings} ج.م</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #E8DDD0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏳</div>
            <div style={{ color: "#8B7355", fontSize: "0.9rem", fontWeight: "600" }}>طلبات معلقة بحاجة لشحن</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#C9A96E", marginTop: "4px" }}>{stats.pendingOrders}</div>
          </div>
        </div>

        {/* أزرار التنقل */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          <Link to="/admin/products" style={{ textDecoration: "none", background: "#3D2B1F", color: "#fff", padding: "1.5rem", borderRadius: "16px", textAlign: "center", fontWeight: "700", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>📦</span> إدارة المنتجات
          </Link>
          <Link to="/admin/orders" style={{ textDecoration: "none", background: "#3D2B1F", color: "#fff", padding: "1.5rem", borderRadius: "16px", textAlign: "center", fontWeight: "700", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>📋</span> إدارة الطلبات
          </Link>
          <Link to="/admin/banners" style={{ textDecoration: "none", background: "#3D2B1F", color: "#fff", padding: "1.5rem", borderRadius: "16px", textAlign: "center", fontWeight: "700", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>🖼️</span> البانرات
          </Link>
          <Link to="/admin/settings" style={{ textDecoration: "none", background: "#3D2B1F", color: "#fff", padding: "1.5rem", borderRadius: "16px", textAlign: "center", fontWeight: "700", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>⚙️</span> الإعدادات
          </Link>
        </div>

        {/* الرسم البياني للأرباح الحقيقية */}
        <div style={{ background: "#fff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0", marginBottom: "2.5rem", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>📈</span>
            <h3 style={{ color: "#3D2B1F", margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>تحليلات المبيعات والأرباح الحقيقية</h3>
          </div>
          
          <div style={{ width: "100%", height: "300px", minHeight: "300px", direction: "ltr", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" stroke="#8B7355" style={{ fontSize: "12px", fontFamily: "Cairo" }} />
                <YAxis stroke="#8B7355" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: "8px", fontFamily: "Cairo" }} />
                <Area type="monotone" dataKey="sales" name="المبيعات الفعلية (ج.م)" stroke="#C9A96E" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* جدول آخر الطلبات */}
        <div style={{ background: "#fff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 25px rgba(0,0,0,0.03)", border: "1px solid #E8DDD0" }}>
          <h3 style={{ color: "#3D2B1F", marginTop: 0, marginBottom: "1.5rem", fontSize: "1.2rem", fontWeight: "700" }}>آخر الطلبات المسجلة</h3>
          <div style={{ overflowX: "auto" }}>
            {lastOrders.length > 0 ? (
              <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse", textAlign: "right" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAF8F5", color: "#8B7355", borderBottom: "1px solid #E8DDD0" }}>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {lastOrders.map((order, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #FAF8F5" }}>
                      <td style={{ fontWeight: "700", color: "#111" }}><code>{order.id}</code></td>
                      <td style={{ color: "#555" }}>{order.customer}</td>
                      <td style={{ fontWeight: "700" }}>{order.price} ج.م</td>
                      <td>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "20px", 
                          fontSize: "0.8rem", 
                          fontWeight: "700",
                          background: order.status === "completed" ? "#F0FFF4" : order.status === "pending" ? "#FFF8F0" : "#FFF0F0",
                          color: order.status === "completed" ? "#4CAF50" : order.status === "pending" ? "#C9A96E" : "#E74C3C",
                          border: order.status === "completed" ? "1px solid #C2F0C2" : order.status === "pending" ? "1px solid #E8DDD0" : "1px solid #FFCCCC"
                        }}>
                          {order.status === "completed" ? "مكتمل" : order.status === "pending" ? "قيد الانتظار" : "ملغي"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#8B7355" }}>📦 لا توجد طلبات مسجلة في قاعدة البيانات حتى الآن. اللوحة على نظافة وبانتظار أول أوردر فخم!</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}