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

  if (loading) return <div style={{ minHeight: "100vh", background: "#FAF7F2" }}><Navbar /><div style={{ textAlign: "center", padding: "5rem" }}>جاري تحميل طلباتك...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h2 style={{ color: "#3D2B1F", marginBottom: "2rem" }}>📦 طلباتي</h2>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: "15px" }}>
            <p>لا توجد طلبات سابقة.</p>
            <Link to="/products">تسوق الآن</Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem", border: "1px solid #E8DDD0" }}>
              <p>رقم الطلب: #{order.id.slice(0, 8)}</p>
              <p>الإجمالي: {order.total} ج.م</p>
              <p>الحالة: <strong>{order.status}</strong></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}