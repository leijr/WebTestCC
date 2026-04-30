import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="dash-loading">
        <div className="dash-skeleton" />
        <div className="dash-skeleton" />
        <div className="dash-skeleton" />
        <div className="dash-skeleton" />
        <style>{`
          .dash-loading { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
          .dash-skeleton { height: 120px; background: #fff; border-radius: var(--radius-md); animation: pulse 1.5s infinite; }
          @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        `}</style>
      </div>
    );
  }

  const cards = [
    { label: "设备总数", value: stats.total_devices, color: "#2563eb", bg: "rgba(37,99,235,0.08)", icon: BoxIcon },
    { label: "可借用", value: stats.available_devices, color: "#16a34a", bg: "rgba(22,163,74,0.08)", icon: CheckIcon },
    { label: "借用中", value: stats.borrowed_devices, color: "#d97706", bg: "rgba(217,119,6,0.08)", icon: ClockIcon },
    { label: "超时未还", value: stats.overdue_count, color: "#dc2626", bg: "rgba(220,38,38,0.08)", icon: AlertIcon },
  ];

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h2>首页概览</h2>
          <p>设备借用状态一览</p>
        </div>
        <span className="dash-date">{new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</span>
      </div>

      <div className="dash-cards">
        {cards.map((c, i) => (
          <div className="dash-card" key={c.label} style={{ "--card-color": c.color, "--card-bg": c.bg, animationDelay: `${i * 0.1}s` }}>
            <div className="dash-card-icon">
              <c.icon />
            </div>
            <div className="dash-card-value">{c.value}</div>
            <div className="dash-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        .dashboard { animation: dashIn 0.5s ease; }
        @keyframes dashIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }
        .dash-header h2 { font-size: 22px; font-weight: 700; color: var(--navy-900); margin-bottom: 4px; }
        .dash-header p { font-size: 13px; color: var(--slate-500); }
        .dash-date { font-size: 13px; color: var(--slate-500); white-space: nowrap; }
        .dash-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .dash-card {
          background: #fff;
          border-radius: var(--radius-md);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
          animation: cardUp 0.5s ease backwards;
        }
        @keyframes cardUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .dash-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--card-color);
        }
        .dash-card-icon {
          width: 40px; height: 40px;
          border-radius: var(--radius-sm);
          background: var(--card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--card-color);
          margin-bottom: 16px;
        }
        .dash-card-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--navy-900);
          font-family: var(--font-mono);
          line-height: 1;
        }
        .dash-card-label {
          font-size: 13px;
          color: var(--slate-500);
          margin-top: 8px;
        }
        @media (max-width: 1000px) { .dash-cards { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 600px) { .dash-cards { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function BoxIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function AlertIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
