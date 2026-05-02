import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, resetPassword } from "../../api/users";

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", role: "employee" });
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [resetCopied, setResetCopied] = useState(false);
  const [formError, setFormError] = useState("");

  const fetch = () => { getUsers().then(({ data }) => setUsers(data)).catch(() => {}); };
  useEffect(fetch, []);

  const openCreate = () => { setEditId(null); setForm({ username: "", email: "", role: "employee" }); setResult(null); setCopied(false); setFormError(""); setShowForm(true); };
  const openEdit = (u) => { setEditId(u.id); setForm({ username: u.username, email: u.email, role: u.role }); setResult(null); setCopied(false); setFormError(""); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      try { await updateUser(editId, form); setShowForm(false); fetch(); }
      catch (err) { setFormError(err.response?.data?.detail || "保存失败"); }
    } else {
      try { const { data } = await createUser(form); setResult(data); fetch(); }
      catch (err) { setFormError(err.response?.data?.detail || "保存失败"); }
    }
  };

  const handleCopyPassword = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => { setShowForm(false); setResult(null); setCopied(false); }, 1500);
    } catch {
      alert("复制失败，密码: " + result.password);
    }
  };

  const handleDelete = async (id) => { if (!confirm("确定删除此用户？")) return; try { await deleteUser(id); fetch(); } catch (err) { setFormError(err.response?.data?.detail || "删除失败"); } };

  const handleReset = async (id) => {
    if (!confirm("确定重置此用户的密码？")) return;
    try {
      const { data } = await resetPassword(id);
      setResetResult(data);
    } catch (err) { setFormError(err.response?.data?.detail || "重置失败"); }
  };

  const handleResetCopy = async () => {
    if (!resetResult) return;
    try {
      await navigator.clipboard.writeText(resetResult.password);
      setResetCopied(true);
      setTimeout(() => { setResetResult(null); setResetCopied(false); }, 1500);
    } catch {
      alert("复制失败，密码: " + resetResult.password);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-header">
        <h2>用户管理</h2>
        <button onClick={openCreate} className="adm-btn">+ 添加用户</button>
      </div>

      {showForm && (
        <div className="adm-form-overlay" onClick={() => { setShowForm(false); setResult(null); }}>
          <div className="adm-form-card" onClick={(e) => e.stopPropagation()}>
            {result ? (
              <div className="adm-success-view">
                <div className="adm-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3>用户创建成功</h3>
                <div className="adm-pwd-box">
                  <span className="adm-pwd-label">初始密码</span>
                  <code className="adm-pwd-value">{result.password}</code>
                </div>
                <p className="adm-success-hint">密码已发送至 {result.email}，用户首次登录需修改密码</p>
                <button onClick={handleCopyPassword} className="adm-btn-copy">
                  {copied ? "已复制 ✓" : "复制密码并关闭"}
                </button>
              </div>
            ) : (
              <>
                <h3>{editId ? "编辑用户" : "添加用户"}</h3>
                {formError && <div className="adm-form-error">{formError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="adm-field"><label>用户名 *</label><input value={form.username} onChange={(e) => setForm({...form,username:e.target.value})} required /></div>
                  <div className="adm-field"><label>邮箱 *</label><input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} required /></div>
                  {editId && (
                    <div className="adm-field">
                      <label>角色</label>
                      <select value={form.role} onChange={(e) => setForm({...form,role:e.target.value})} className="adm-select">
                        <option value="employee">员工</option><option value="admin">管理员</option>
                      </select>
                    </div>
                  )}
                  <div className="adm-form-btns">
                    <button type="submit" className="adm-btn">保存</button>
                    <button type="button" onClick={() => setShowForm(false)} className="adm-btn-cancel">取消</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {resetResult && (
        <div className="adm-form-overlay" onClick={() => setResetResult(null)}>
          <div className="adm-form-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-success-view">
              <div className="adm-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>密码重置成功</h3>
              <div className="adm-pwd-box">
                <span className="adm-pwd-label">新密码</span>
                <code className="adm-pwd-value">{resetResult.password}</code>
              </div>
              <p className="adm-success-hint">新密码已发送邮件通知用户，请提醒用户登录后修改密码</p>
              <button onClick={handleResetCopy} className="adm-btn-copy">
                {resetCopied ? "已复制 ✓" : "复制密码并关闭"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>用户名</th><th>邮箱</th><th>角色</th><th>操作</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="adm-name">{u.username}</td><td>{u.email}</td><td>{u.role === "admin" ? "管理员" : "员工"}</td>
                <td>
                  <button onClick={() => openEdit(u)} className="adm-btn-sm">编辑</button>
                  <button onClick={() => handleReset(u.id)} className="adm-btn-sm adm-btn-warn">重置密码</button>
                  {u.role !== "admin" && <button onClick={() => handleDelete(u.id)} className="adm-btn-sm adm-btn-danger">删除</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .adm-page { animation: admIn 0.4s ease; }
        @keyframes admIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .adm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .adm-header h2 { font-size: 20px; font-weight: 700; color: var(--navy-900); }
        .adm-btn { padding: 8px 18px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .adm-btn:hover { background: var(--navy-700); transform: translateY(-1px); }
        .adm-btn-cancel { padding: 8px 18px; background: var(--slate-200); color: var(--slate-700); border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; }
        .adm-btn-sm { padding: 4px 12px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; margin-right: 6px; transition: all var(--transition); }
        .adm-btn-sm:hover { transform: translateY(-1px); }
        .adm-btn-warn { background: #fff; color: #d97706; border: 1px solid #fde68a; }
        .adm-btn-warn:hover { background: #fffbeb; }
        .adm-btn-danger { background: #fff; color: var(--red); border: 1px solid #fecaca; }
        .adm-btn-danger:hover { background: #fef2f2; }
        .adm-form-overlay { position: fixed; inset: 0; background: rgba(15,15,35,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .adm-form-card { background: #fff; border-radius: var(--radius-md); padding: 28px; width: 440px; box-shadow: var(--shadow-lg); }
        .adm-form-card h3 { font-size: 18px; font-weight: 700; color: var(--navy-900); margin-bottom: 20px; }
        .adm-form-error { background: #fef2f2; color: var(--red); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; border-left: 3px solid var(--red); font-size: 13px; }
        .adm-field { margin-bottom: 14px; }
        .adm-field label { display: block; font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .adm-field input, .adm-select { width: 100%; padding: 9px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); outline: none; transition: border-color var(--transition); }
        .adm-field input:focus, .adm-select:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .adm-select { background: #fff; }
        .adm-form-btns { display: flex; gap: 10px; margin-top: 20px; }
        .adm-table-wrap { background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid var(--slate-200); }
        .adm-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid var(--slate-100); }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tr:hover td { background: #f8f9fb; }
        .adm-name { font-weight: 600; color: var(--navy-900); }

        .adm-success-view { text-align: center; padding: 12px 0; }
        .adm-success-icon { margin-bottom: 12px; }
        .adm-success-view h3 { font-size: 18px; font-weight: 700; color: var(--navy-900); margin-bottom: 16px; }
        .adm-pwd-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 16px; margin-bottom: 12px; }
        .adm-pwd-label { display: block; font-size: 11px; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .adm-pwd-value { font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--navy-900); letter-spacing: 2px; }
        .adm-success-hint { font-size: 12px; color: var(--slate-500); margin-bottom: 20px; }
        .adm-btn-copy { padding: 10px 24px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .adm-btn-copy:hover { background: var(--navy-700); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
