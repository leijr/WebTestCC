import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/auth";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("两次输入的新密码不一致"); return; }
    if (newPassword.length < 6) { setError("新密码至少6位"); return; }
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "修改失败");
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-card">
        <h2>修改密码</h2>
        <p className="cp-sub">首次登录需修改密码后方可使用系统</p>

        {success && <div className="cp-success">密码修改成功，正在跳转...</div>}
        {error && <div className="cp-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label>原密码</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="输入原密码" required />
          </div>
          <div className="cp-field">
            <label>新密码</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="输入新密码（至少6位）" required />
          </div>
          <div className="cp-field">
            <label>确认新密码</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" required />
          </div>
          <button type="submit" className="cp-btn">确认修改</button>
        </form>
      </div>

      <style>{`
        .cp-page { display: flex; justify-content: center; padding-top: 40px; }
        .cp-card { background: #fff; border-radius: var(--radius-md); padding: 36px; width: 440px; box-shadow: var(--shadow-md); }
        .cp-card h2 { font-size: 20px; font-weight: 700; color: var(--navy-900); margin-bottom: 4px; }
        .cp-sub { font-size: 13px; color: var(--slate-500); margin-bottom: 24px; }
        .cp-success { background: #f0fdf4; color: var(--green); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; border-left: 3px solid var(--green); font-size: 13px; }
        .cp-error { background: #fef2f2; color: var(--red); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; border-left: 3px solid var(--red); font-size: 13px; }
        .cp-field { margin-bottom: 16px; }
        .cp-field label { display: block; font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .cp-field input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); outline: none; transition: border-color var(--transition); }
        .cp-field input:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        .cp-btn { width: 100%; padding: 12px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 15px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; letter-spacing: 0.5px; transition: all var(--transition); margin-top: 8px; }
        .cp-btn:hover { background: var(--navy-700); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,15,35,0.3); }
      `}</style>
    </div>
  );
}
