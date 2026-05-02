import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login(username, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("email", data.email);
      if (data.must_change_password) {
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-shape" />
        <div className="login-bg-shape" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-card-wrapper">
        <div className="login-brand">
          <div className="login-logo">
            <img src="/zf-logo.png" alt="ZF" className="login-logo-img" />
          </div>
          <h1>DeviceManagement by ZF-EYDFT</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label>用户名</label>
            <div className="input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="输入用户名" required />
            </div>
          </div>

          <div className="input-group">
            <label>密码</label>
            <div className="input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" required />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? "登录中..." : "登 录"}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          overflow: hidden;
          font-family: var(--font-sans);
        }
        .login-bg {
          position: fixed;
          inset: 0;
          background: var(--navy-900);
        }
        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .login-bg-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
        }
        .login-bg-shape:first-of-type {
          width: 500px; height: 500px;
          background: var(--indigo);
          top: -150px; right: -100px;
        }
        .login-bg-shape:last-of-type {
          width: 400px; height: 400px;
          background: var(--blue);
          bottom: -120px; left: -80px;
        }
        .login-card-wrapper {
          position: relative;
          z-index: 1;
          width: 420px;
          background: rgba(255,255,255,0.97);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.05);
          padding: 48px 40px 40px;
          backdrop-filter: blur(20px);
          animation: loginFadeIn 0.6s ease;
        }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-brand { text-align: center; margin-bottom: 36px; }
        .login-logo { margin-bottom: 16px; display: flex; justify-content: center; }
        .login-logo-img { width: 56px; height: 56px; border-radius: 14px; object-fit: contain; }
        .login-brand h1 {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 700;
          color: var(--navy-900);
          letter-spacing: -0.5px;
        }
        .login-brand p {
          font-size: 13px;
          color: var(--slate-500);
          margin-top: 4px;
        }
        .login-error {
          background: #fef2f2;
          color: var(--red);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 16px;
          border-left: 3px solid var(--red);
        }
        .input-group { margin-bottom: 18px; }
        .input-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--slate-700);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border: 1.5px solid var(--slate-200);
          border-radius: var(--radius-sm);
          background: var(--white);
          transition: border-color var(--transition);
        }
        .input-wrapper:focus-within {
          border-color: var(--indigo);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
        .input-wrapper svg { color: var(--slate-300); flex-shrink: 0; }
        .input-wrapper input {
          width: 100%;
          padding: 12px 0;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: var(--font-sans);
          color: var(--navy-900);
        }
        .login-btn {
          width: 100%;
          padding: 13px;
          margin-top: 10px;
          background: var(--navy-900);
          color: var(--white);
          border: none;
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all var(--transition);
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .login-btn:hover:not(:disabled) {
          background: var(--navy-700);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15,15,35,0.3);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
