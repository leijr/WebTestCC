import { useEffect, useState } from "react";
import { getMyBorrows, returnDevice } from "../api/borrow";

export default function MyBorrows() {
  const [records, setRecords] = useState([]);

  const fetch = () => { getMyBorrows().then(({ data }) => setRecords(data)).catch(() => {}); };
  useEffect(fetch, []);

  const handleReturn = async (id) => {
    const condition = prompt("归还状态 (good/damaged/lost):", "good");
    if (!condition) return;
    try {
      await returnDevice(id, { return_condition: condition, notes: "" });
      alert("归还成功");
      fetch();
    } catch (err) { alert(err.response?.data?.detail || "归还失败"); }
  };

  return (
    <div className="mb-page">
      <h2 className="mb-title">我的借用记录</h2>
      <div className="mb-table-wrap">
        <table className="mb-table">
          <thead><tr><th>设备</th><th>序列号</th><th>借用时间</th><th>预计归还</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td className="mb-name">{r.device_name}</td>
                <td className="mb-mono">{r.device_sn}</td>
                <td>{new Date(r.borrow_date).toLocaleDateString()}</td>
                <td>{new Date(r.expected_return_date).toLocaleDateString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{(r.status === "borrowed" || r.status === "overdue") && <button onClick={() => handleReturn(r.id)} className="mb-btn">归还</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .mb-page { animation: mbIn 0.4s ease; }
        @keyframes mbIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .mb-title { font-size: 20px; font-weight: 700; color: var(--navy-900); margin-bottom: 20px; }
        .mb-table-wrap { background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; }
        .mb-table { width: 100%; border-collapse: collapse; }
        .mb-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid var(--slate-200); }
        .mb-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid var(--slate-100); }
        .mb-table tr:last-child td { border-bottom: none; }
        .mb-table tr:hover td { background: #f8f9fb; }
        .mb-name { font-weight: 600; color: var(--navy-900); }
        .mb-mono { font-family: var(--font-mono); font-size: 13px; color: var(--slate-500); }
        .mb-btn { padding: 5px 14px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .mb-btn:hover { background: var(--navy-700); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { borrowed:["借用中","#d97706"], returned:["已归还","#16a34a"], overdue:["已超时","#dc2626"] };
  const [text,color] = m[status]||[status,"#888"];
  return <span style={{ display:"inline-block",padding:"2px 10px",borderRadius:12,background:color+"15",color,fontSize:12,fontWeight:600 }}>{text}</span>;
}
