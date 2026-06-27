"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Briefcase, Calendar, Clock, BarChart2,
  Bell, Settings, LogOut, Menu, X, ChevronRight,
  TrendingUp, DollarSign, Clock3, CalendarCheck,
  Shield, Mail, User, Hash,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

// ── Sidebar Nav Items ──────────────────────────

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Briefcase, label: "Employers", href: "/dashboard/employers", active: false },
  { icon: Calendar, label: "Shifts", href: "/dashboard/shifts", active: false },
  { icon: Clock, label: "Clock In/Out", href: "/dashboard/clock", active: false },
  { icon: CalendarCheck, label: "Calendar", href: "/dashboard/calendar", active: false },
  { icon: BarChart2, label: "Reports", href: "/dashboard/reports", active: false },
];

// ── Avatar Component ───────────────────────────

function Avatar({ user }: { user: { displayName: string | null; email: string; profilePicture: string | null } }) {
  const initials = user.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  if (user.profilePicture) {
    return (
      <Image
        src={user.profilePicture}
        alt={user.displayName ?? "Profile"}
        width={48}
        height={48}
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return <div className="avatar">{initials}</div>;
}

// ── Stat Card Component ────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  comingSoon = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  comingSoon?: boolean;
}) {
  return (
    <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Accent glow */}
      <div style={{
        position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px",
        borderRadius: "50%", background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}18`, border: `1px solid ${color}30`,
        }}>
          <Icon size={18} style={{ color }} aria-hidden="true" />
        </div>
        {comingSoon && (
          <span style={{
            fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
            color: "var(--text-muted)", background: "rgba(255,255,255,0.05)",
            padding: "3px 8px", borderRadius: "20px", border: "1px solid var(--glass-border)",
          }}>
            Soon
          </span>
        )}
      </div>
      <div className="font-mono" style={{ fontSize: "26px", fontWeight: 700, marginBottom: "4px", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

// ── Info Row ───────────────────────────────────

function InfoRow({ icon: Icon, label, value, extra }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      padding: "14px 0",
      borderBottom: "1px solid var(--glass-border)",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
      }}>
        <Icon size={15} style={{ color: "var(--indigo-400)" }} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
          {label}
        </div>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </div>
      </div>
      {extra}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    dispatch(logout());
    toast.success("Signed out successfully");
    router.push("/login");
  }

  if (!user) return null;

  const displayName = user.displayName ?? user.email.split("@")[0];
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const joinedDaysAgo = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Background */}
      <div className="mesh-bg" aria-hidden="true"><div className="mesh-orb" /></div>

      {/* ── Sidebar ── */}
      <nav
        className="sidebar"
        style={{ transform: mobileMenuOpen ? "translateX(0)" : undefined }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 14px", marginBottom: "32px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>RotaPay</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Workforce Management</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`nav-item${item.active ? " active" : ""}`}
              aria-current={item.active ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); if (!item.active) toast(`${item.label} coming soon`, { icon: "🔜" }); }}
            >
              <item.icon size={17} aria-hidden="true" />
              {item.label}
              {!item.active && <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.4 }} />}
            </a>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--glass-border)" }}>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); toast("Notifications coming soon", { icon: "🔜" }); }}>
            <Bell size={17} aria-hidden="true" /> Notifications
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); toast("Settings coming soon", { icon: "🔜" }); }}>
            <Settings size={17} aria-hidden="true" /> Settings
          </a>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#ef4444" }}
          >
            <LogOut size={17} aria-hidden="true" /> Sign out
          </button>
        </div>

        {/* User mini profile */}
        <div style={{
          marginTop: "20px", padding: "12px", borderRadius: "12px",
          background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <Avatar user={user} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 39, backdropFilter: "blur(4px)" }}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Content ── */}
      <main
        style={{ flex: 1, marginLeft: "260px", padding: "32px", position: "relative", zIndex: 1, minHeight: "100vh" }}
        role="main"
      >
        {/* Mobile header */}
        <div style={{ display: "none" }} className="mobile-header">
          <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>

        {/* ── Page Header ── */}
        <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "4px", fontWeight: 500 }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", margin: 0 }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
              <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {displayName}
              </span>
              {" "}👋
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "9px 16px", borderRadius: "10px", cursor: "pointer",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: "13px", fontWeight: 500,
              transition: "all 0.2s",
            }}
            aria-label="Sign out"
          >
            <LogOut size={15} aria-hidden="true" /> Sign out
          </button>
        </header>

        {/* ── Stat Cards ── */}
        <section aria-label="Overview statistics" style={{ marginBottom: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <StatCard
              icon={DollarSign}
              label="Total earnings"
              value="£0.00"
              sub="No shifts added yet"
              color="#10b981"
              comingSoon
            />
            <StatCard
              icon={Clock3}
              label="Hours worked"
              value="0h"
              sub="This month"
              color="#6366f1"
              comingSoon
            />
            <StatCard
              icon={TrendingUp}
              label="Active employers"
              value="0"
              sub="Add your first employer"
              color="#8b5cf6"
              comingSoon
            />
            <StatCard
              icon={CalendarCheck}
              label="Upcoming shifts"
              value="0"
              sub="Schedule your shifts"
              color="#06b6d4"
              comingSoon
            />
          </div>
        </section>

        {/* ── Bottom Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>

          {/* Profile Card */}
          <section className="glass-card" style={{ padding: "28px" }} aria-label="Your profile">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Your profile</h2>
              <button
                style={{
                  fontSize: "12px", fontWeight: 500, color: "var(--indigo-400)",
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                  padding: "6px 12px", borderRadius: "8px", cursor: "pointer",
                }}
                onClick={() => toast("Profile settings coming soon", { icon: "🔜" })}
              >
                Edit profile
              </button>
            </div>

            {/* Avatar + name hero */}
            <div style={{
              display: "flex", alignItems: "center", gap: "16px", padding: "20px",
              borderRadius: "14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)",
              marginBottom: "20px",
            }}>
              <div style={{ position: "relative" }}>
                <Avatar user={user} />
                <div style={{
                  position: "absolute", bottom: "-2px", right: "-2px",
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: user.emailVerified ? "#10b981" : "#f59e0b",
                  border: "2px solid var(--navy-900)",
                }} title={user.emailVerified ? "Email verified" : "Email not verified"} />
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px" }}>{displayName}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{user.email}</div>
                <div style={{ marginTop: "8px" }}>
                  <span className={`badge ${user.emailVerified ? "badge-verified" : "badge-pending"}`}>
                    {user.emailVerified ? "✓ Verified" : "⚠ Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div>
              <InfoRow icon={User} label="Display name" value={user.displayName ?? "Not set"} />
              <InfoRow icon={Mail} label="Email address" value={user.email} />
              <InfoRow
                icon={Shield}
                label="Account status"
                value={user.emailVerified ? "Verified & active" : "Pending email verification"}
                extra={
                  <span className={`badge ${user.emailVerified ? "badge-verified" : "badge-pending"}`}>
                    {user.emailVerified ? "Active" : "Pending"}
                  </span>
                }
              />
              <InfoRow
                icon={Hash}
                label="User ID"
                value={<span className="font-mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.id}</span>}
              />
              <div style={{ padding: "14px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                  }}>
                    <CalendarCheck size={15} style={{ color: "var(--indigo-400)" }} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                      Member since
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>
                      {memberSince}{" "}
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                        ({joinedDaysAgo === 0 ? "today" : `${joinedDaysAgo} day${joinedDaysAgo !== 1 ? "s" : ""} ago`})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions + Welcome */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Welcome card */}
            <div style={{
              padding: "24px", borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
              border: "1px solid rgba(99,102,241,0.2)",
            }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>🎉</div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Welcome to RotaPay!</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Your account is set up. Start by adding your first employer and scheduling your shifts.
              </p>
              <button
                className="btn-primary"
                style={{ padding: "10px 20px", fontSize: "13px", borderRadius: "10px" }}
                onClick={() => toast("Employer management coming soon", { icon: "🔜" })}
              >
                Add first employer
              </button>
            </div>

            {/* Quick actions */}
            <div className="glass-card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px", color: "var(--text-secondary)" }}>
                Quick actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { icon: Briefcase, label: "Add employer", color: "#10b981" },
                  { icon: Calendar, label: "Schedule a shift", color: "#6366f1" },
                  { icon: Clock, label: "Clock in now", color: "#8b5cf6" },
                  { icon: BarChart2, label: "View reports", color: "#06b6d4" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => toast(`${action.label} coming soon`, { icon: "🔜" })}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "11px 14px", borderRadius: "10px", cursor: "pointer",
                      background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)", fontSize: "13px", fontWeight: 500,
                      transition: "all 0.2s", textAlign: "left", width: "100%",
                    }}
                  >
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${action.color}15`,
                    }}>
                      <action.icon size={14} style={{ color: action.color }} aria-hidden="true" />
                    </div>
                    {action.label}
                    <ChevronRight size={13} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
          main { margin-left: 0 !important; }
          .mobile-header { display: flex !important; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        }
        @media (max-width: 768px) {
          main { padding: 20px !important; }
          div[style*="gridTemplateColumns: 1fr 340px"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: repeat(auto-fit"] { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
