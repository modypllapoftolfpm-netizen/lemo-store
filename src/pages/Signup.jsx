import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../firebase/auth";
import { useLang } from "../context/LangContext";
import Navbar from "../components/layout/Navbar";

export default function Signup() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      await signUp({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      navigate("/");
    } catch (err) {
      setError("حدث خطأ، ربما البريد الإلكتروني مستخدم من قبل");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "12px", borderRadius: "10px",
    border: "1px solid #E8DDD0", fontSize: "1rem",
    outline: "none", boxSizing: "border-box", marginBottom: "1rem"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar />
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "3rem 1rem"
      }}>
        <div style={{
          background: "#fff", borderRadius: "20px",
          padding: "2.5rem", width: "100%", maxWidth: "420px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
        }}>
          <h1 style={{ textAlign: "center", color: "#3D2B1F", marginBottom: "2rem", fontSize: "1.8rem" }}>
            📝 {t.auth.signupTitle}
          </h1>

          {error && (
            <div style={{
              background: "#fff0f0", border: "1px solid #ffcccc",
              borderRadius: "10px", padding: "12px", marginBottom: "1rem",
              color: "#cc0000", textAlign: "center"
            }}>{error}</div>
          )}

          <form onSubmit={handleSignup}>
            <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.auth.name}</label>
            <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />

            <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.auth.email}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} />

            <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.auth.phone}</label>
            <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />

            <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.auth.password}</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required style={inputStyle} />

            <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>{t.auth.confirmPassword}</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required style={inputStyle} />

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "#C9A96E", color: "#fff",
              border: "none", borderRadius: "10px", padding: "14px",
              fontSize: "1rem", fontWeight: "700", cursor: "pointer", marginTop: "0.5rem"
            }}>
              {loading ? "جاري الإنشاء..." : t.auth.signupBtn}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#8B7355" }}>
            {t.auth.hasAccount}{" "}
            <Link to="/login" style={{ color: "#C9A96E", fontWeight: "700" }}>
              {t.auth.loginBtn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}