import { useEffect, useState, useRef } from "react";
import { getDevices, createDevice, updateDevice, deleteDevice } from "../../api/devices";

const API_BASE = "http://localhost:8000";

export default function DeviceManage() {
  const [devices, setDevices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", serial_number: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const fetch = () => { getDevices().then(({ data }) => setDevices(data)).catch(() => {}); };
  useEffect(fetch, []);

  const resetForm = () => {
    setForm({ name: "", description: "", category: "", serial_number: "" });
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openCreate = () => { setEditId(null); resetForm(); setShowForm(true); };
  const openEdit = (d) => {
    setEditId(d.id);
    setForm({ name: d.name, description: d.description || "", category: d.category || "", serial_number: d.serial_number });
    setImageFile(null);
    setImagePreview(d.image_url ? API_BASE + d.image_url : null);
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (imageFile) data.image = imageFile;
      if (editId) { await updateDevice(editId, data); } else { await createDevice(data); }
      setShowForm(false); fetch();
    } catch (err) { alert(err.response?.data?.detail || "保存失败"); }
  };

  const handleDelete = async (id) => { if (!confirm("确定删除此设备？")) return; try { await deleteDevice(id); fetch(); } catch (err) { alert(err.response?.data?.detail || "删除失败"); } };

  return (
    <div className="adm-page">
      <div className="adm-header">
        <h2>设备管理</h2>
        <button onClick={openCreate} className="adm-btn">+ 添加设备</button>
      </div>

      {showForm && (
        <div className="adm-form-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-form-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? "编辑设备" : "添加设备"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="adm-field">
                <label>设备图片</label>
                <div className="adm-image-upload">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="adm-image-preview" />
                  ) : (
                    <div className="adm-image-empty">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} ref={fileRef} className="adm-file-input" />
                </div>
              </div>
              <div className="adm-field"><label>名称 *</label><input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} required /></div>
              <div className="adm-field"><label>描述</label><input value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} /></div>
              <div className="adm-field"><label>分类</label><input value={form.category} onChange={(e) => setForm({...form,category:e.target.value})} /></div>
              <div className="adm-field"><label>序列号 *</label><input value={form.serial_number} onChange={(e) => setForm({...form,serial_number:e.target.value})} required /></div>
              <div className="adm-form-btns">
                <button type="submit" className="adm-btn">保存</button>
                <button type="button" onClick={() => setShowForm(false)} className="adm-btn-cancel">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="adm-grid">
        {devices.map((d) => (
          <div className="adm-card" key={d.id}>
            <div className="adm-card-img">
              {d.image_url ? (
                <img src={API_BASE + d.image_url} alt={d.name} />
              ) : (
                <div className="adm-card-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
            </div>
            <div className="adm-card-body">
              <h3 className="adm-card-name">{d.name}</h3>
              <div className="adm-card-meta">
                <span>{d.category || "-"}</span>
                <span className="adm-card-sn">{d.serial_number}</span>
              </div>
              <div className="adm-card-actions">
                <StatusBadge status={d.status} />
                <div>
                  <button onClick={() => openEdit(d)} className="adm-btn-sm">编辑</button>
                  <button onClick={() => handleDelete(d.id)} className="adm-btn-sm adm-btn-danger">删除</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .adm-page { animation: admIn 0.4s ease; }
        @keyframes admIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .adm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .adm-header h2 { font-size: 20px; font-weight: 700; color: var(--navy-900); }
        .adm-btn { padding: 8px 18px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
        .adm-btn:hover { background: var(--navy-700); transform: translateY(-1px); }
        .adm-btn-cancel { padding: 8px 18px; background: var(--slate-200); color: var(--slate-700); border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; }

        .adm-form-overlay { position: fixed; inset: 0; background: rgba(15,15,35,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .adm-form-card { background: #fff; border-radius: var(--radius-md); padding: 28px; width: 460px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
        .adm-form-card h3 { font-size: 18px; font-weight: 700; color: var(--navy-900); margin-bottom: 20px; }
        .adm-field { margin-bottom: 14px; }
        .adm-field label { display: block; font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .adm-field input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); outline: none; }
        .adm-field input:focus { border-color: var(--indigo); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .adm-image-upload { position: relative; height: 140px; border: 2px dashed var(--slate-200); border-radius: var(--radius-sm); overflow: hidden; cursor: pointer; }
        .adm-image-upload:hover { border-color: var(--indigo); background: rgba(79,70,229,0.03); }
        .adm-image-preview { width: 100%; height: 100%; object-fit: cover; }
        .adm-image-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--slate-300); }
        .adm-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .adm-form-btns { display: flex; gap: 10px; margin-top: 20px; }

        .adm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1400px) { .adm-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1000px) { .adm-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .adm-grid { grid-template-columns: 1fr; } }

        .adm-card { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); transition: all var(--transition); }
        .adm-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .adm-card-img { height: 140px; background: var(--slate-100); }
        .adm-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .adm-card-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--slate-300); }
        .adm-card-body { padding: 14px; }
        .adm-card-name { font-size: 14px; font-weight: 600; color: var(--navy-900); margin-bottom: 4px; }
        .adm-card-meta { font-size: 12px; color: var(--slate-500); margin-bottom: 10px; display: flex; justify-content: space-between; }
        .adm-card-sn { font-family: var(--font-mono); color: var(--slate-400); font-size: 11px; }
        .adm-card-actions { display: flex; justify-content: space-between; align-items: center; }
        .adm-btn-sm { padding: 4px 12px; background: var(--navy-900); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; margin-left: 6px; transition: all var(--transition); }
        .adm-btn-sm:hover { transform: translateY(-1px); }
        .adm-btn-danger { background: #fff; color: var(--red); border: 1px solid #fecaca; }
        .adm-btn-danger:hover { background: #fef2f2; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { available:["可借用","#16a34a"], borrowed:["借用中","#d97706"], retired:["已退役","#888"] };
  const [text,color] = m[status]||[status,"#888"];
  return <span style={{ display:"inline-block",padding:"2px 10px",borderRadius:12,background:color+"15",color,fontSize:11,fontWeight:600 }}>{text}</span>;
}
