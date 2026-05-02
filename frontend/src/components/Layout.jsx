import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  useEffect(() => { setExpanded(false); }, [location.pathname]);

  const logout = () => { localStorage.clear(); navigate("/login"); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="layout-root">
      {expanded && <div className="rail-backdrop" onClick={() => setExpanded(false)} />}

      <aside className={`side-rail ${expanded ? "expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}>
        <div className="rail-head" onClick={() => setExpanded(!expanded)}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="url(#railGrad)"/>
            <defs><linearGradient id="railGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c9a92"/><stop offset="100%" stopColor="#5b8c7a"/></linearGradient></defs>
            <rect x="9" y="14" width="8" height="12" rx="3" fill="#fff" opacity="0.95"/>
            <rect x="23" y="14" width="8" height="12" rx="3" fill="#fff" opacity="0.95"/>
            <rect x="16" y="22" width="8" height="6" rx="3" fill="#fff" opacity="0.8"/>
          </svg>
          {expanded && <span className="rail-brand">DMS</span>}
        </div>

        <nav className="rail-nav">
          <RailItem to="/" icon={HomeIcon} label="首页" active={isActive("/") && location.pathname === "/"} expanded={expanded} />
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {expanded && <span>退出</span>}
          </button>
        </div>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>

      <style>{`
        .layout-root { display: flex; min-height: 100vh; background: #f7f4f0; font-family: var(--font-sans); }

        .rail-backdrop {
          display: none;
          position: fixed; inset: 0; z-index: 180;
          background: rgba(60,50,40,0.15);
        }
        @media (max-width: 640px) {
          .rail-backdrop { display: block; }
        }

        .side-rail {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 190;
          width: 64px;
          background: #fff;
          display: flex; flex-direction: column;
          transition: width 0.28s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.28s;
          border-right: 1px solid #f0ece8;
          overflow: hidden;
          box-shadow: 2px 0 12px rgba(0,0,0,0.03);
        }
        .side-rail.expanded {
          width: 240px;
          box-shadow: 4px 0 24px rgba(0,0,0,0.08);
        }

        .rail-head {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 16px; cursor: pointer;
          border-bottom: 1px solid #f0ece8;
          min-height: 72px;
        }
        .rail-brand { font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: #3d4f47; white-space: nowrap; }

        .rail-nav { flex: 1; padding: 8px; overflow-y: auto; overflow-x: hidden; }
        .rail-section {
          padding: 16px 14px 8px; margin-top: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          color: #b8a99a; text-transform: uppercase; white-space: nowrap;
          height: auto; overflow: hidden;
        }

        .rail-footer { padding: 8px; border-top: 1px solid #f0ece8; }
        .rail-user { display: flex; align-items: center; gap: 10px; padding: 6px; margin-bottom: 4px; }
        .rail-avatar {
          width: 34px; height: 34px; min-width: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #e8987b, #f0b8a0);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700;
        }
        .rail-user-info { white-space: nowrap; overflow: hidden; }
        .rail-username { font-size: 13px; font-weight: 600; color: #3d4f47; }
        .rail-role { font-size: 11px; color: #b8a99a; }
        .rail-logout {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px; background: #f7f4f0; border: none; border-radius: 10px;
          color: #8c7b6e; font-size: 12px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.2s;
        }
        .rail-logout:hover { background: #f0e8e0; color: #5c4a3a; }

        .rail-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; margin-bottom: 2px; border-radius: 10px;
          color: #6b5e52; text-decoration: none;
          font-size: 14px; font-weight: 500; white-space: nowrap;
          transition: all 0.18s; min-height: 44px;
        }
        .rail-item:hover { background: #f5f1ec; color: #3d4f47; }
        .rail-item.active { background: #eef5f2; color: #4a7c6b; font-weight: 600; }
        .rail-item svg { flex-shrink: 0; }

        .main-area { flex: 1; padding: 28px; margin-left: 64px; min-height: 100vh; transition: margin-left 0.28s cubic-bezier(0.22, 0.61, 0.36, 1); }
        .side-rail.expanded ~ .main-area { margin-left: 240px; }

        @media (max-width: 640px) {
          .side-rail:not(.expanded) { width: 0; }
          .main-area { margin-left: 0; padding: 16px; }
          .side-rail.expanded ~ .main-area { margin-left: 240px; }
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
