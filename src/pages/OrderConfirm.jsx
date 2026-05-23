import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { getOrder } from "../firebase/orders";

export default function OrderConfirm() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(id).then(setOrder);
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ color: "#3D2B1F", fontSize: "2rem", marginBottom: "1rem" }}>
          تم تأكيد طلبك!
        </h1>
        <p style={{ color: "#8B7355", marginBottom: "0.5rem" }}>
          رقم الطلب: <strong style={{ color: "#C9A96E" }}>{id}</strong>
        </p>
        {order?.paymentMethod === "fawry" && order?.fawryRef && (
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "1.5rem",
            maxWidth: "400px", margin: "1.5rem auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#3D2B1F", fontWeight: "700", marginBottom: "8px" }}>🏪 كود فوري</p>
            <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "#C9A96E" }}>{order.fawryRef}</p>
            <p style={{ color: "#8B7355", fontSize: "0.9rem" }}>ادفع الكود ده في أي فرع فوري</p>
          </div>
        )}
        {order && (
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "1.5rem",
            maxWidth: "400px", margin: "1.5rem auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#8B7355", marginBottom: "8px" }}>الإجمالي: <strong style={{ color: "#C9A96E" }}>{order.total} ج.م</strong></p>
            <p style={{ color: "#8B7355" }}>العنوان: <strong>{order.address}</strong></p>
          </div>
        )}
        <Link to="/" style={{
          display: "inline-block", marginTop: "1rem",
          background: "#C9A96E", color: "#fff",
          padding: "12px 30px", borderRadius: "25px",
          textDecoration: "none", fontWeight: "700"
        }}>🏠 الرجوع للرئيسية</Link>
      </div>
    </div>
  );
}