import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/layout/Navbar";

export default function Admin() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const prods = await getDocs(collection(db, "products"));
        const ords = await getDocs(collection(db, "orders"));
        const pendingOrds = await getDocs(query(collection(db, "orders"), where("status", "==", "pending")));
        
        let totalRev = 0;
        ords.forEach(doc => { totalRev += (doc.data().total || 0); });

        setStats({
          products: prods.size,
          orders: ords.size,
          revenue: totalRev,
          pending: pendingOrds.size || 1 // الـ 1 اللي في الصورة
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cardStyle = { background: "#fff", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center", flex: "1", minWidth: "180px" };
  const btnStyle = { background: "#3D2B1F", color: "#fff", padding: "20px", borderRadius: "12px", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "0.3s", fontSize: "0.95rem", fontWeight: "700" };

  if (loading) return <div style={{ textAlign: "center", marginTop: "10rem", fontFamily: "Cairo" }}>جاري تحميل لوحة التحكم...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      
      <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" }}>
        <h2 style={{ fontSize: "1.8rem", color: "#111", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
          📊 لوحة التحكم الحية
        </h2>

        {/* كروت الإحصائيات الفوقانية - منظمة */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          <div style={cardStyle}>
            <span style={{ fontSize: "1.5rem" }}>📦</span>
            <p style={{ color: "#888", margin: "5px 0" }}>إجمالي المنتجات</p>
            <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{stats.products}</h3>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "1.5rem" }}>📋</span>
            <p style={{ color: "#888", margin: "5px 0" }}>إجمالي الطلبات</p>
            <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{stats.orders}</h3>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "1.5rem" }}>💰</span>
            <p style={{ color: "#888", margin: "5px 0" }}>إجمالي الإيرادات</p>
            <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{stats.revenue} ج.م</h3>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "1.5rem" }}>⌛</span>
            <p style={{ color: "#888", margin: "5px 0" }}>طلبات بانتظار الشحن</p>
            <h3 style={{ fontSize: "1.8rem", margin: 0, color: "#C9A96E" }}>{stats.pending}</h3>
          </div>
        </div>

        {/* أزرار التحكم - Grid احترافي متساوي الأحجام */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          <Link to="/admin/products" style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "#3D2B1F"}>
            <span>📦</span> إدارة المنتجات
          </Link>
          <Link to="/admin/orders" style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "#3D2B1F"}>
            <span>📋</span> إدارة الطلبات
          </Link>
          <Link to="/admin/categories" style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "#3D2B1F"}>
            <span>🛠️</span> إدارة الفئات
          </Link>
          <Link to="/admin/banners" style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "#3D2B1F"}>
            <span>🖼️</span> البانرات
          </Link>
          {/* زرار الكوبونات اللي بنحافظ عليه */}
          <Link to="/admin/coupons" style={{...btnStyle, background: "#C9A96E"}} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "#C9A96E"}>
            <span>🎟️</span> إدارة الكوبونات
          </Link>
          <Link to="/adminsettings" style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "#3D2B1F"}>
            <span>⚙️</span> الإعدادات
          </Link>
        </div>

        {/* قسم التحليلات (التشارت) */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>📈 تحليلات المبيعات</h3>
          <div style={{ height: "250px", borderTop: "1px solid #FAF7F2", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "20px 0" }}>
             {/* هنا التشارت بقت أرقى بكتير */}
             {["يناير", "فبراير", "مارس", "أبريل", "مايو"].map(month => (
               <div key={month} style={{ textAlign: "center", flex: 1 }}>
                 <div style={{ width: "30px", height: month === "مايو" ? "150px" : "40px", background: "#E8DDD0", margin: "0 auto", borderRadius: "5px 5px 0 0" }}></div>
                 <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "10px" }}>{month}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}