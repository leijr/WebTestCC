import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/auth";

export default function Profile() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    if (newPassword !== confirmPassword) { setPwdError("两次输入的密码不一致"); return; }
    if (newPassword.length < 6) { setPwdError("新密码至少6位"); return; }
    try {
      await changePassword(oldPassword, newPassword);
      setPwdSuccess(true);
      setTimeout(() => {
        setShowPwdForm(false);
        setPwdSuccess(false);
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      }, 1500);
    } catch (err) {
      setPwdError(err.response?.data?.detail || "修改失败，请检查原密码");
    }
  };

  return (
    <div className="pf-page">
      <h2 className="pf-title">个人信息</h2>

      <div className="pf-card">
        <div className="pf-avatar">{username?.[0]?.toUpperCase() || "U"}</div>
        <div className="pf-info">
          <div className="pf-row"><span>用户名</span><strong>{username}</strong></div>
          <div className="pf-row"><span>角色</span><strong className="pf-badge">{role === "admin" ? "管理员" : "员工"}</strong></div>
          <div className="pf-row"><span>ID</span><strong className="pf-mono">{userId}</strong></div>
        </div>
      </div>

      <div className="pf-card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--navy-900)" }}>安全设置</h3>
          {!showPwdForm && (
            <button onClick={() => setShowPwdForm(true)} className="pf-pwd-btn">修改密码</button>
          )}
        </div>

        {showPwdForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: 16 }}>
            {pwdSuccess && <div className="pf-success">密码修改成功！</div>}
            {pwdError && <div className="pf-error">{pwdError}</div>}
            <div className="pf-field">
              <label>原密码</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="输入原密码" required />
            </div>
            <div className="pf-field">
              <label>新密码</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少6位" required />
            </div>
            <div className="pf-field">
              <label>确认新密码</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入" required />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="pf-pwd-btn" style={{ background: "var(--navy-900)", color: "#fff", border: "none" }}>确认修改</button>
              <button type="button" onClick={() => setShowPwdForm(false)} className="pf-pwd-btn" style={{ background: "var(--slate-200)", color: "var(--slate-700)", border: "none" }}>取消</button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .pf-page { animation: pfIn 0.4s ease; }
        @keyframes pfIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .pf-title { font-size: 20px; font-weight: 700; color: var(--navy-900); margin-bottom: 20px; }
        .pf-card { background: #fff; border-radius: var(--radius-md); padding: 32px; box-shadow: var(--shadow-sm); }
        .pf-avatar { width: 64px; height: 64px; border-radius: 14px; background: var(--indigo); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; flex-shrink: 0; }
        .pf-info { flex: 1; }
        .pf-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--slate-100); font-size: 14px; }
        .pf-row:last-child { border-bottom: none; }
        .pf-row span { color: var(--slate-500); }
        .pf-row strong { color: var(--navy-900); }
        .pf-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; background: rgba(79,70,229,0.1); color: var(--indigo) !important; font-size: 12px; }
        .pf-mono { font-family: var(--font-mono); font-size: 13px; color: var(--slate-500) !important; }
        .pf-pwd-btn { padding: 8px 18px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); border: 1px solid var(--slate-200); background: #fff; color: var(--navy-900); }
        .pf-pwd-btn:hover { border-color: var(--indigo); color: var(--indigo); }
        .pf-success { background: #f0fdf4; color: var(--green); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px; border-left: 3px solid var(--green); font-size: 13px; }
        .pf-error { background: #fef2f2; color: var(--red); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px; border-left: 3px solid var(--red); font-size: 13px; }
        .pf-field { margin-bottom: 14px; }
        .pf-field label { display: block; font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .pf-field input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); outline: none; transition: border-color var(--transition); max-width: 360px; }
        .pf-field input:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
      `}</style>
    </div>
  );
}
