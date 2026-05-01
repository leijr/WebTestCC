import { useEffect, useState } from "react";
import { getMyBorrows, returnDevice } from "../api/borrow";

export default function MyBorrows() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [returnModal, setReturnModal] = useState(null);
  const [condition, setCondition] = useState("正常");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetch = () => { getMyBorrows().then(({ data }) => { setRecords(data); setFilteredRecords(data); }).catch(() => {}); };
  useEffect(fetch, []);

  useEffect(() => {
    let r = records;
    if (startDate) r = r.filter((x) => new Date(x.borrow_date) >= new Date(startDate));
    if (endDate) r = r.filter((x) => new Date(x.borrow_date) <= new Date(endDate + "T23:59:59"));
    setFilteredRecords(r);
  }, [startDate, endDate, records]);

  const openReturn = (record) => { setReturnModal(record); setCondition("正常"); };
  const confirmReturn = async () => {
    if (!returnModal) return;
    const condMap = { "正常": "good", "损坏": "damaged", "丢失": "lost" };
    try {
      await returnDevice(returnModal.id, { return_condition: condMap[condition] || condition, notes: "" });
      setReturnModal(null);
      fetch();
    } catch (err) { alert(err.response?.data?.detail || "归还失败"); }
  };

  return (
    <div className="mb-page">
      <h2 className="mb-title">我的借用记录</h2>

      <div className="mb-filters">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mb-date-input" placeholder="开始日期" />
        <span className="mb-date-sep">至</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mb-date-input" placeholder="结束日期" />
        {(startDate || endDate) && <button onClick={() => { setStartDate(""); setEndDate(""); }} className="mb-clear-btn">清除筛选</button>}
        <span className="mb-total">{filteredRecords.length} 条记录</span>
      </div>

      <div className="mb-table-wrap">
        <table className="mb-table">
          <thead><tr><th>设备</th><th>序列号</th><th>借用时间</th><th>预计归还</th><th>实际归还</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {filteredRecords.map((r) => (
              <tr key={r.id}>
                <td className="mb-name">{r.device_name}</td>
                <td className="mb-mono">{r.device_sn}</td>
                <td>{new Date(r.borrow_date).toLocaleDateString()}</td>
                <td>{new Date(r.expected_return_date).toLocaleDateString()}</td>
                <td>{r.actual_return_date ? new Date(r.actual_return_date).toLocaleDateString() : "-"}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{(r.status === "borrowed" || r.status === "overdue") && <button onClick={() => openReturn(r)} className="mb-btn">归还</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {returnModal && (
        <div className="mb-modal-overlay" onClick={() => setReturnModal(null)}>
          <div className="mb-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>归还设备</h3>
            <p className="mb-modal-device">{returnModal.device_name}</p>
            <div className="mb-modal-field">
              <label>设备状态</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="mb-modal-select">
                <option value="正常">正常</option>
                <option value="损坏">损坏</option>
                <option value="丢失">丢失</option>
              </select>
            </div>
            <div className="mb-modal-btns">
              <button onClick={confirmReturn} className="mb-modal-confirm">确认归还</button>
              <button onClick={() => setReturnModal(null)} className="mb-modal-cancel">取消</button>
            </div>
          </div>
        </div>
      )}

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

        .mb-filters { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .mb-date-input { padding: 7px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font-sans); outline: none; transition: border-color var(--transition); }
        .mb-date-input:focus { border-color: var(--indigo); }
        .mb-date-sep { font-size: 13px; color: var(--slate-500); }
        .mb-clear-btn { padding: 5px 12px; background: transparent; color: var(--slate-500); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 12px; font-family: var(--font-sans); cursor: pointer; }
        .mb-clear-btn:hover { border-color: var(--slate-300); color: var(--slate-700); }
        .mb-total { margin-left: auto; font-size: 13px; color: var(--slate-500); font-family: var(--font-mono); }

        .mb-modal-overlay { position: fixed; inset: 0; background: rgba(15,15,35,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .mb-modal-card { background: #fff; border-radius: var(--radius-md); padding: 28px; width: 400px; box-shadow: var(--shadow-lg); }
        .mb-modal-card h3 { font-size: 18px; font-weight: 700; color: var(--navy-900); margin-bottom: 4px; }
        .mb-modal-device { font-size: 14px; color: var(--slate-500); margin-bottom: 20px; }
        .mb-modal-field { margin-bottom: 20px; }
        .mb-modal-field label { display: block; font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .mb-modal-select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); outline: none; background: #fff; transition: border-color var(--transition); }
        .mb-modal-select:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .mb-modal-btns { display: flex; gap: 10px; }
        .mb-modal-confirm { flex: 1; padding: 10px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .mb-modal-confirm:hover { background: var(--navy-700); }
        .mb-modal-cancel { padding: 10px 20px; background: var(--slate-200); color: var(--slate-700); border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { borrowed:["借用中","#d97706"], returned:["已归还","#16a34a"], overdue:["已超时","#dc2626"] };
  const [text,color] = m[status]||[status,"#888"];
  return <span style={{ display:"inline-block",padding:"2px 10px",borderRadius:12,background:color+"15",color,fontSize:12,fontWeight:600 }}>{text}</span>;
}
