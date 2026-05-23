import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { getOrder } from "../firebase/orders";

export default function OrderConfirm() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getOrder(id).then(setOrder);
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ color: "#3D2B1F", fontSize: "2rem", marginBottom: "1rem" }}>تم استلام طلبك!</h1>
        <p style={{ color: "#8B7355", marginBottom: "0.5rem" }}>رقم الطلب: <strong style={{ color: "#C9A96E" }}>#{id.slice(-8)}</strong></p>

        {order && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", margin: "1.5rem 0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#8B7355", marginBottom: "8px" }}>الإجمالي: <strong style={{ color: "#C9A96E" }}>{order.total} ج.م</strong></p>
            <p style={{ color: "#8B7355", margin: 0 }}>العنوان: <strong>{order.address}</strong></p>
          </div>
        )}

        {/* Contact Box */}
        <div style={{ background: "linear-gradient(135deg, #3D2B1F, #6B4C3B)", borderRadius: "20px", padding: "2rem", margin: "1.5rem 0", color: "#fff" }}>
          <p style={{ margin: "0 0 8px", opacity: 0.8, fontSize: "0.95rem" }}>برجاء التواصل معنا لإتمام الطلب</p>
          <p style={{ margin: "0 0 1.5rem", fontSize: "2rem", fontWeight: "800", color: "#C9A96E" }}>01009633100</p>
          <a href="https://wa.me/201009633100" target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#25D366", color: "#fff", padding: "12px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "700", fontSize: "1rem" }}>
            💬 تواصل على واتساب
          </a>
        </div>

        <Link to="/" style={{ display: "inline-block", marginTop: "1rem", background: "linear-gradient(135deg, #C9A96E, #b8925a)", color: "#fff", padding: "12px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "700" }}>
          🏠 الرجوع للرئيسية
        </Link>
      </div>
    </div>
  );
}