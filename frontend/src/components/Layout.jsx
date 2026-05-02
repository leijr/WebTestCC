import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const logout = () => { localStorage.clear(); navigate("/login"); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="layout-root">
      {expanded && <div className="rail-backdrop" onClick={() => setExpanded(false)} />}

      <aside className={`side-rail ${expanded ? "expanded" : ""}`}>
        <div className="rail-head" onClick={() => setExpanded(!expanded)}>
          <img src="/zf-logo.png" alt="ZF" className="rail-logo-img" />
          {expanded && <span className="rail-brand">ZF</span>}
        </div>

        <nav className="rail-nav">
          <RailItem to="/" icon={HomeIcon} label="首页" active={isActive("/") && !isActive("/admin") && !isActive("/devices") && !isActive("/my-borrows") && !isActive("/profile")} expanded={expanded} />
          <RailItem to="/devices" icon={BoxIcon} label="设备列表" active={isActive("/devices")} expanded={expanded} />
          {role !== "admin" && (
            <RailItem to="/my-borrows" icon={BookIcon} label="我的借用" active={isActive("/my-borrows")} expanded={expanded} />
          )}
          {role === "admin" && (
            <>
              <div className="rail-section">{expanded ? "管理" : ""}</div>
              <RailItem to="/admin/devices" icon={ToolsIcon} label="设备管理" active={isActive("/admin/devices")} expanded={expanded} />
              <RailItem to="/admin/users" icon={PeopleIcon} label="用户管理" active={isActive("/admin/users")} expanded={expanded} />
              <RailItem to="/admin/borrows" icon={ListIcon} label="借用记录" active={isActive("/admin/borrows")} expanded={expanded} />
            </>
          )}
          <RailItem to="/profile" icon={UserIcon} label="个人信息" active={isActive("/profile")} expanded={expanded} />
        </nav>

        <div className="rail-footer">
          <div className="rail-user">
            <div className="rail-avatar">{username?.[0]?.toUpperCase() || "U"}</div>
            {expanded && (
              <div className="rail-user-info">
                <div className="rail-username">{username}</div>
                <div className="rail-role">{role === "admin" ? "管理员" : "员工"}</div>
              </div>
            )}
          </div>
          <button onClick={logout} className="rail-logout" title="退出登录">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {expanded && <span>退出</span>}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="rail-toggle" title={expanded ? "收起" : "展开"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {expanded ? <><polyline points="15 18 9 12 15 6"/></> : <><polyline points="9 18 15 12 9 6"/></>}
            </svg>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>

      <style>{`
        .layout-root { display: flex; min-height: 100vh; background: #f2f2f7; font-family: var(--font-sans); }

        .rail-backdrop {
          display: none;
          position: fixed; inset: 0; z-index: 180;
          background: rgba(0,0,0,0.12);
          backdrop-filter: blur(4px);
        }
        @media (max-width: 640px) {
          .rail-backdrop { display: block; }
        }

        .side-rail {
          position: fixed; top: 12px; left: 12px; bottom: 12px; z-index: 190;
          width: 64px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex; flex-direction: column;
          transition: width var(--transition), box-shadow var(--transition);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(255,255,255,0.6) inset;
        }
        .side-rail.expanded {
          width: 240px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(255,255,255,0.6) inset;
        }

        .rail-head {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 14px; cursor: pointer;
          min-height: 72px;
        }
        .rail-logo-img { width: 36px; height: 36px; border-radius: 9px; object-fit: contain; flex-shrink: 0; }
        .rail-brand { font-family: var(--font-mono); font-size: 17px; font-weight: 700; color: var(--navy-900); white-space: nowrap; letter-spacing: -0.5px; }

        .rail-nav { flex: 1; padding: 4px 8px; overflow-y: auto; overflow-x: hidden; }
        .rail-section {
          padding: 18px 14px 8px; margin-top: 2px;
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          color: var(--slate-500); text-transform: uppercase; white-space: nowrap;
        }

        .rail-footer { padding: 8px; border-top: 1px solid rgba(0,0,0,0.06); }
        .rail-user { display: flex; align-items: center; gap: 10px; padding: 6px; margin-bottom: 4px; }
        .rail-avatar {
          width: 34px; height: 34px; min-width: 34px; border-radius: 11px;
          background: linear-gradient(135deg, #007aff, #5856d6);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; letter-spacing: 0;
        }
        .rail-user-info { white-space: nowrap; overflow: hidden; }
        .rail-username { font-size: 13px; font-weight: 600; color: var(--navy-900); }
        .rail-role { font-size: 11px; color: var(--slate-500); }
        .rail-logout {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px; background: rgba(0,0,0,0.03); border: none; border-radius: 12px;
          color: var(--slate-500); font-size: 12px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.2s;
        }
        .rail-logout:hover { background: rgba(255,59,48,0.08); color: var(--red); }

        .rail-toggle {
          width: 100%; display: flex; align-items: center; justify-content: center;
          padding: 6px; margin-top: 4px;
          background: transparent; border: none; border-radius: 10px;
          color: var(--slate-500); cursor: pointer;
          transition: all 0.2s;
        }
        .rail-toggle:hover { background: rgba(0,0,0,0.05); color: var(--navy-900); }

        .rail-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; margin-bottom: 2px; border-radius: 12px;
          color: var(--slate-500); text-decoration: none;
          font-size: 14px; font-weight: 500; white-space: nowrap;
          transition: all 0.18s; min-height: 44px;
        }
        .rail-item:hover { background: rgba(0,0,0,0.04); color: var(--navy-900); }
        .rail-item.active { background: rgba(0,122,255,0.1); color: var(--blue); font-weight: 600; }
        .rail-item svg { flex-shrink: 0; }

        .main-area {
          flex: 1; margin: 12px 12px 12px 88px;
          padding: 28px; min-height: calc(100vh - 24px);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 24px;
          transition: margin-left var(--transition);
        }
        .side-rail.expanded ~ .main-area { margin-left: 264px; }

        @media (max-width: 640px) {
          .side-rail { top: 8px; left: 8px; bottom: 8px; border-radius: 20px; }
          .side-rail:not(.expanded) { width: 0; border: none; box-shadow: none; }
          .main-area { margin: 8px; border-radius: 20px; padding: 16px; }
          .side-rail:not(.expanded) ~ .main-area { margin-left: 8px; }
          .side-rail.expanded ~ .main-area { margin-left: 8px; }
        }
      `}</style>
    </div>
  );
}

function RailItem({ to, icon: Icon, label, active, expanded }) {
  return (
    <Link to={to} className={`rail-item ${active ? "active" : ""}`} title={!expanded ? label : undefined}>
      <Icon />
      <span style={{ opacity: expanded ? 1 : 0, transition: "opacity 0.15s" }}>{label}</span>
    </Link>
  );
}

function HomeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function BoxIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function BookIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function ToolsIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>; }
function PeopleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function ListIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function UserIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
