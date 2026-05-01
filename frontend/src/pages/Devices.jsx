import { useEffect, useState } from "react";
import { getDevices, getCategories } from "../api/devices";
import { borrowDevice } from "../api/borrow";

const API_BASE = "http://localhost:8000";

function calcReturnDate(num, unit) {
  const now = new Date();
  if (unit === "天") now.setDate(now.getDate() + num);
  else if (unit === "周") now.setDate(now.getDate() + num * 7);
  else if (unit === "月") now.setMonth(now.getMonth() + num);
  return now;
}

function formatDate(d) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => { getCategories().then(({ data }) => setCategories(data)).catch(() => {}); }, []);

  const [borrowModal, setBorrowModal] = useState(null);
  const [borrowNum, setBorrowNum] = useState(7);
  const [borrowUnit, setBorrowUnit] = useState("天");
  const [toast, setToast] = useState(null);

  const fetch = () => {
    getDevices({ category: category || undefined, status: status || undefined, keyword: keyword || undefined })
      .then(({ data }) => setDevices(data)).catch(() => {});
  };
  useEffect(fetch, [category, status, keyword]);

  const openBorrow = (device) => {
    setBorrowModal(device);
    setBorrowNum(7);
    setBorrowUnit("天");
  };

  const confirmBorrow = async () => {
    if (!borrowModal) return;
    const returnDate = calcReturnDate(borrowNum, borrowUnit);
    const iso = returnDate.toISOString().slice(0, 19);
    try {
      await borrowDevice({ device_id: borrowModal.id, expected_return_date: iso });
      setBorrowModal(null);
      setToast({ type: "success", msg: `借用成功！预计 ${formatDate(returnDate)} 归还` });
      fetch();
    } catch (err) { setToast({ type: "error", msg: err.response?.data?.detail || "借用失败" }); }
  };

  const returnDate = borrowModal ? calcReturnDate(borrowNum, borrowUnit) : null;

  return (
    <div className="dv-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="dv-header">
        <h2>设备列表</h2>
        <span className="dv-count">{devices.length} 台设备</span>
      </div>

      <div className="dv-filters">
        <input placeholder="搜索名称 / 序列号" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="dv-filter-input" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="dv-filter-select">
          <option value="">全部分类</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="dv-filter-select">
          <option value="">全部状态</option><option value="available">可借用</option><option value="borrowed">借用中</option><option value="损坏">已损坏</option><option value="丢失">已丢失</option>
        </select>
      </div>

      <div className="dv-grid">
        {devices.map((d) => (
          <div className="dv-card" key={d.id}>
            <div className="dv-card-img">
              {d.image_url ? (
                <img src={API_BASE + d.image_url} alt={d.name} />
              ) : (
                <div className="dv-card-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
              <span className="dv-card-badge" style={{ background: statusColor(d.status) + "18", color: statusColor(d.status) }}>{statusText(d.status)}</span>
            </div>
            <div className="dv-card-body">
              <h3 className="dv-card-name">{d.name}</h3>
              <div className="dv-card-meta">
                <span>{d.category || "未分类"}</span>
                <span className="dv-card-sn">{d.serial_number}</span>
              </div>
              {role === "employee" && d.status === "available" && (
                <button onClick={() => openBorrow(d)} className="dv-card-btn">借用</button>
              )}
              {d.status !== "available" && (
                <div className="dv-card-disabled">
                  {statusText(d.status)}
                  {d.borrowed_by && <span className="dv-card-borrower"> · {d.borrowed_by}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
        {devices.length === 0 && <div className="dv-empty">暂无设备</div>}
      </div>

      {borrowModal && (
        <div className="dv-modal-overlay" onClick={() => setBorrowModal(null)}>
          <div className="dv-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>借用设备</h3>
            <p className="dv-modal-device">{borrowModal.name}</p>

            <div className="dv-borrow-row">
              <span className="dv-borrow-label">借用时长</span>
              <div className="dv-borrow-inputs">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={borrowNum}
                  onChange={(e) => setBorrowNum(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  className="dv-borrow-num"
                />
                <select value={borrowUnit} onChange={(e) => setBorrowUnit(e.target.value)} className="dv-borrow-unit">
                  <option value="天">天</option>
                  <option value="周">周</option>
                  <option value="月">月</option>
                </select>
              </div>
            </div>

            <div className="dv-borrow-preview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>预计 <strong>{formatDate(returnDate)}</strong> 归还</span>
            </div>

            <div className="dv-borrow-btns">
              <button onClick={confirmBorrow} className="dv-borrow-confirm">确认借用</button>
              <button onClick={() => setBorrowModal(null)} className="dv-borrow-cancel">取消</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dv-page { animation: dvIn 0.4s ease; }
        @keyframes dvIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .dv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .dv-header h2 { font-size: 20px; font-weight: 700; color: var(--navy-900); }
        .dv-count { font-size: 13px; color: var(--slate-500); font-family: var(--font-mono); }
        .dv-filters { display: flex; gap: 10px; margin-bottom: 24px; }
        .dv-filter-input, .dv-filter-select { padding: 8px 14px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font-sans); outline: none; background: #fff; transition: border-color var(--transition); }
        .dv-filter-input:focus, .dv-filter-select:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .dv-filter-input { width: 220px; }

        .dv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1400px) { .dv-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1000px) { .dv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .dv-grid { grid-template-columns: 1fr; } }

        .dv-card { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); transition: all var(--transition); }
        .dv-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .dv-card-img { position: relative; height: 160px; background: var(--slate-100); overflow: hidden; }
        .dv-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .dv-card-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--slate-300); }
        .dv-card-badge { position: absolute; top: 10px; right: 10px; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .dv-card-body { padding: 16px; }
        .dv-card-name { font-size: 15px; font-weight: 600; color: var(--navy-900); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dv-card-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--slate-500); margin-bottom: 12px; }
        .dv-card-sn { font-family: var(--font-mono); color: var(--slate-400); }
        .dv-card-btn { width: 100%; padding: 8px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .dv-card-btn:hover { background: var(--navy-700); }
        .dv-card-disabled { width: 100%; padding: 8px; text-align: center; background: var(--slate-100); color: var(--slate-500); border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; }
        .dv-card-borrower { color: var(--indigo); font-weight: 600; }
        .dv-empty { grid-column: 1/-1; text-align: center; padding: 60px; color: var(--slate-400); font-size: 14px; }

        .dv-modal-overlay { position: fixed; inset: 0; background: rgba(15,15,35,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .dv-modal-card { background: #fff; border-radius: var(--radius-md); padding: 28px; width: 400px; box-shadow: var(--shadow-lg); }
        .dv-modal-card h3 { font-size: 18px; font-weight: 700; color: var(--navy-900); margin-bottom: 4px; }
        .dv-modal-device { font-size: 13px; color: var(--slate-500); margin-bottom: 20px; }
        .dv-borrow-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .dv-borrow-label { font-size: 14px; font-weight: 600; color: var(--navy-900); }
        .dv-borrow-inputs { display: flex; gap: 8px; align-items: center; }
        .dv-borrow-num { width: 72px; padding: 8px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-mono); text-align: center; outline: none; }
        .dv-borrow-num:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .dv-borrow-unit { padding: 8px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); outline: none; background: #fff; }
        .dv-borrow-unit:focus { border-color: var(--indigo); }
        .dv-borrow-preview { display: flex; align-items: center; gap: 8px; padding: 12px; background: #eff6ff; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 14px; color: var(--navy-900); }
        .dv-borrow-preview svg { color: var(--indigo); flex-shrink: 0; }
        .dv-borrow-preview strong { color: var(--indigo); }
        .dv-borrow-btns { display: flex; gap: 10px; }
        .dv-borrow-confirm { flex: 1; padding: 10px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .dv-borrow-confirm:hover { background: var(--navy-700); }
        .dv-borrow-cancel { padding: 10px 20px; background: var(--slate-200); color: var(--slate-700); border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; }
      `}</style>
    </div>
  );
}

function statusColor(s) {
  const m = { available: "#16a34a", borrowed: "#d97706", "损坏": "#dc2626", "丢失": "#dc2626" };
  return m[s] || "#888";
}
function statusText(s) {
  const m = { available: "可借用", borrowed: "借用中", "损坏": "已损坏", "丢失": "已丢失" };
  return m[s] || s;
}

function Toast({ type, msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const isSuccess = type === "success";
  return (
    <div className={`dv-toast ${isSuccess ? "dv-toast-ok" : "dv-toast-err"}`} onClick={onClose}>
      <div className="dv-toast-icon">
        {isSuccess ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        )}
      </div>
      <span>{msg}</span>
      <style>{`
        .dv-toast { position: fixed; top: 24px; right: 24px; z-index: 999; display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 500; font-family: var(--font-sans); cursor: pointer; animation: toastIn 0.35s ease; box-shadow: var(--shadow-lg); }
        @keyframes toastIn { from { opacity:0; transform: translateX(40px); } to { opacity:1; transform: translateX(0); } }
        .dv-toast-ok { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .dv-toast-err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .dv-toast-icon { flex-shrink: 0; display: flex; }
      `}</style>
    </div>
  );
}
