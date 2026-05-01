import { useEffect, useState } from "react";
import { getAllBorrows, exportBorrows } from "../../api/borrow";
import { getUsers } from "../../api/users";
import { getDevices } from "../../api/devices";

export default function AllBorrows() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filters, setFilters] = useState({ user_id:"", device_id:"", status:"", start:"", end:"" });

  useEffect(() => { getUsers().then(({data}) => setUsers(data)).catch(()=>{}); getDevices().then(({data}) => setDevices(data)).catch(()=>{}); }, []);

  const fetch = (p = 1) => {
    const params = {};
    for (const k in filters) if (filters[k]) params[k] = filters[k];
    params.page = p; params.size = 20;
    getAllBorrows(params).then(({data}) => { setRecords(data.items); setTotal(data.total); setPage(data.page); }).catch(()=>{});
  };
  useEffect(() => { fetch(1); }, [filters]);

  const handleExport = async () => {
    const params = {};
    for (const k in filters) if (filters[k]) params[k] = filters[k];
    try {
      const { data } = await exportBorrows(params);
      const url = URL.createObjectURL(data);
      const a = document.createElement("a"); a.href = url; a.download = "borrow_records.xlsx"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert("导出失败"); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="br-page">
      <div className="br-header">
        <h2>借用记录</h2>
        <button onClick={handleExport} className="br-btn-export">导出 Excel</button>
      </div>

      <div className="br-filters">
        <select value={filters.user_id} onChange={(e) => setFilters({...filters,user_id:e.target.value})} className="br-filter">
          <option value="">全部借用人</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        <select value={filters.device_id} onChange={(e) => setFilters({...filters,device_id:e.target.value})} className="br-filter">
          <option value="">全部设备</option>
          {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.serial_number})</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({...filters,status:e.target.value})} className="br-filter">
          <option value="">全部状态</option><option value="borrowed">借用中</option><option value="returned">已归还</option><option value="overdue">已超时</option>
        </select>
        <input type="date" value={filters.start} onChange={(e) => setFilters({...filters,start:e.target.value})} className="br-filter" />
        <input type="date" value={filters.end} onChange={(e) => setFilters({...filters,end:e.target.value})} className="br-filter" />
      </div>

      <div className="br-table-wrap">
        <table className="br-table">
          <thead><tr><th>借用人</th><th>设备</th><th>序列号</th><th>借用时间</th><th>预计归还</th><th>实际归还</th><th>状态</th><th>归还状态</th></tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td className="br-name">{r.username}</td><td>{r.device_name}</td><td className="br-mono">{r.device_sn}</td>
                <td>{new Date(r.borrow_date).toLocaleDateString()}</td>
                <td>{new Date(r.expected_return_date).toLocaleDateString()}</td>
                <td>{r.actual_return_date ? new Date(r.actual_return_date).toLocaleDateString() : "-"}</td>
                <td><StatusBadge status={r.status} /></td><td>{condText(r.return_condition)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="br-pagination">
          {Array.from({length: totalPages}, (_,i) => (
            <button key={i} onClick={() => fetch(i+1)} className={`br-page-btn ${page===i+1?"active":""}`}>{i+1}</button>
          ))}
        </div>
      )}

      <style>{`
        .br-page { animation: brIn 0.4s ease; }
        @keyframes brIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .br-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .br-header h2 { font-size: 20px; font-weight: 700; color: var(--navy-900); }
        .br-btn-export { padding: 8px 18px; background: var(--green); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .br-btn-export:hover { background: #15803d; transform: translateY(-1px); }
        .br-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .br-filter { padding: 8px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font-sans); outline: none; background: #fff; transition: border-color var(--transition); }
        .br-filter:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .br-table-wrap { background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; }
        .br-table { width: 100%; border-collapse: collapse; }
        .br-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 600; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid var(--slate-200); white-space: nowrap; }
        .br-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--slate-100); }
        .br-table tr:last-child td { border-bottom: none; }
        .br-table tr:hover td { background: #f8f9fb; }
        .br-name { font-weight: 600; color: var(--navy-900); }
        .br-mono { font-family: var(--font-mono); font-size: 12px; color: var(--slate-500); }
        .br-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 20px; }
        .br-page-btn { width: 36px; height: 36px; border: 1px solid var(--slate-200); border-radius: var(--radius-sm); background: #fff; font-size: 13px; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); display: flex; align-items: center; justify-content: center; }
        .br-page-btn:hover { border-color: var(--indigo); color: var(--indigo); }
        .br-page-btn.active { background: var(--navy-900); color: #fff; border-color: var(--navy-900); }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { borrowed:["借用中","#d97706"], returned:["已归还","#16a34a"], overdue:["已超时","#dc2626"] };
  const [text,color] = m[status]||[status,"#888"];
  return <span style={{ display:"inline-block",padding:"2px 10px",borderRadius:12,background:color+"15",color,fontSize:12,fontWeight:600 }}>{text}</span>;
}

function condText(c) {
  const m = { good: "正常", damaged: "损坏", lost: "丢失" };
  return m[c] || c || "-";
}
