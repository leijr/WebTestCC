import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="layout">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--indigo)"/>
              <path d="M8 12h6v8H8zM18 12h6v8h-6zM13 20h6v4h-6z" fill="var(--white)" opacity="0.9"/>
            </svg>
            {!collapsed && <span>DeviceOS</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/" icon={HomeIcon} label="首页" active={isActive("/") && !isActive("/admin")} collapsed={collapsed} />
          <NavItem to="/devices" icon={GridIcon} label="设备列表" active={isActive("/devices")} collapsed={collapsed} />
          {role !== "admin" && (
            <NavItem to="/my-borrows" icon={BookIcon} label="我的借用" active={isActive("/my-borrows")} collapsed={collapsed} />
          )}

          {role === "admin" && (
            <>
              <div className="sidebar-section">管理</div>
              <NavItem to="/admin/devices" icon={SettingsIcon} label="设备管理" active={isActive("/admin/devices")} collapsed={collapsed} />
              <NavItem to="/admin/users" icon={UsersIcon} label="用户管理" active={isActive("/admin/users")} collapsed={collapsed} />
              <NavItem to="/admin/borrows" icon={ListIcon} label="借用记录" active={isActive("/admin/borrows")} collapsed={collapsed} />
            </>
          )}
          <NavItem to="/profile" icon={UserIcon} label="个人信息" active={isActive("/profile")} collapsed={collapsed} />
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="avatar">{username?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div className="sidebar-username">{username || "User"}</div>
                <div className="sidebar-role">{role === "admin" ? "管理员" : "员工"}</div>
              </div>
            </div>
          )}
          <button onClick={logout} className="logout-btn" title="退出登录">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .layout { display: flex; min-height: 100vh; font-family: var(--font-sans); }
        .sidebar {
          width: 240px;
          min-width: 240px;
          background: var(--navy-900);
          color: #e0e0e0;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          transition: width var(--transition), min-width var(--transition);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar.collapsed { width: 68px; min-width: 68px; }
        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }
        .sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
        .sidebar-section {
          padding: 16px 12px 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.3);
        }
        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          margin-bottom: 8px;
        }
        .avatar {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--indigo);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .sidebar-username { font-size: 13px; font-weight: 600; color: #e0e0e0; }
        .sidebar-role { font-size: 11px; color: rgba(255,255,255,0.4); }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-sm);
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 13px;
          font-family: var(--font-sans);
          transition: all var(--transition);
        }
        .logout-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
        .main-content {
          flex: 1;
          padding: 32px;
          background: var(--slate-100);
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, active, collapsed }) {
  return (
    <Link to={to} className={`nav-item ${active ? "active" : ""}`} title={collapsed ? label : undefined}>
      <Icon />
      {!collapsed && <span>{label}</span>}
      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2px;
          transition: all var(--transition);
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
        .nav-item.active { background: rgba(79,70,229,0.25); color: #fff; }
        .nav-item svg { flex-shrink: 0; }
      `}</style>
    </Link>
  );
}

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function BookIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ListIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
