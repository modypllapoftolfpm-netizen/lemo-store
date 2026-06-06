import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn, loginWithGoogle } from "../firebase/auth"; // 👈 تم إضافة استدعاء جوجل هنا
import { useLang } from "../context/LangContext";
import Navbar from "../components/layout/Navbar";

export default function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── الدخول بالإيميل والباسورد ─────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
    setLoading(false);
  };

  // ─── الدخول بحساب جوجل ─────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/"); // توجيه للصفحة الرئيسية بعد النجاح
    } catch (err) {
      setError("حدث خطأ أثناء محاولة تسجيل الدخول باستخدام جوجل.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Cairo', sans-serif" }} dir="rtl">
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
            🔐 {t.auth.loginTitle}
          </h1>

          {error && (
            <div style={{
              background: "#fff0f0", border: "1px solid #ffcccc",
              borderRadius: "10px", padding: "12px", marginBottom: "1rem",
              color: "#cc0000", textAlign: "center", fontWeight: "bold"
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>
                {t.auth.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px", borderRadius: "10px",
                  border: "1px solid #E8DDD0", fontSize: "1rem",
                  outline: "none", boxSizing: "border-box", background: "#FCFAFC"
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "#3D2B1F", fontWeight: "600" }}>
                {t.auth.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px", borderRadius: "10px",
                  border: "1px solid #E8DDD0", fontSize: "1rem",
                  outline: "none", boxSizing: "border-box", background: "#FCFAFC"
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "#C9A96E", color: "#fff",
              border: "none", borderRadius: "10px", padding: "14px",
              fontSize: "1rem", fontWeight: "700", cursor: "pointer", transition: "0.3s"
            }}>
              {loading ? "جاري الدخول..." : t.auth.loginBtn}
            </button>
          </form>

          {/* 👈 فاصل شيك بين الدخول العادي وجوجل */}
          <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#E8DDD0" }}></div>
            <span style={{ padding: "0 15px", color: "#8B7355", fontSize: "0.9rem", fontWeight: "bold" }}>أو</span>
            <div style={{ flex: 1, height: "1px", background: "#E8DDD0" }}></div>
          </div>

          {/* 👈 زرار الدخول بجوجل */}
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            style={{ 
              width: "100%", 
              background: "#fff", 
              color: "#3D2B1F", 
              padding: "12px", 
              border: "2px solid #E8DDD0", 
              borderRadius: "10px", 
              cursor: "pointer", 
              fontWeight: "bold",
              fontSize: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              transition: "0.3s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#FAF7F2"}
            onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google Logo" 
              style={{ width: "22px", height: "22px" }} 
            />
            المتابعة باستخدام Google
          </button>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#8B7355" }}>
            {t.auth.noAccount}{" "}
            <Link to="/signup" style={{ color: "#C9A96E", fontWeight: "700" }}>
              {t.auth.signupBtn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}