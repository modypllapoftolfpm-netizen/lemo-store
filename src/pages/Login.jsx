import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../firebase/auth";
import { useLang } from "../context/LangContext";
import Navbar from "../components/layout/Navbar";

export default function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            🔐 {t.auth.loginTitle}
          </h1>

          {error && (
            <div style={{
              background: "#fff0f0", border: "1px solid #ffcccc",
              borderRadius: "10px", padding: "12px", marginBottom: "1rem",
              color: "#cc0000", textAlign: "center"
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
                  outline: "none", boxSizing: "border-box"
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
                  outline: "none", boxSizing: "border-box"
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "#C9A96E", color: "#fff",
              border: "none", borderRadius: "10px", padding: "14px",
              fontSize: "1rem", fontWeight: "700", cursor: "pointer"
            }}>
              {loading ? "جاري الدخول..." : t.auth.loginBtn}
            </button>
          </form>

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