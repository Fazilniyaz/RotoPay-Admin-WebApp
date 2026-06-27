"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser, clearError } from "@/store/slices/authSlice";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["", "#ef4444", "#f59e0b", "#f59e0b", "#10b981"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: "3px", borderRadius: "2px",
              background: i <= score ? colors[score] : "rgba(255,255,255,0.1)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {checks.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: "11px", display: "flex", alignItems: "center", gap: "4px",
              color: c.ok ? "#10b981" : "var(--text-muted)",
              transition: "color 0.2s",
            }}
          >
            <CheckCircle size={11} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password)) e.password = "Must contain an uppercase letter";
    else if (!/[a-z]/.test(form.password)) e.password = "Must contain a lowercase letter";
    else if (!/\d/.test(form.password)) e.password = "Must contain a number";
    if (form.displayName && form.displayName.length < 2) e.displayName = "Must be at least 2 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(registerUser({
      email: form.email,
      password: form.password,
      displayName: form.displayName || undefined,
    }));

    if (registerUser.fulfilled.match(result)) {
      setRegistered(true);
    } else {
      toast.error(result.payload as string || "Registration failed");
    }
  }

  // ── Success State ──────────────────────────
  if (registered) {
    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="mesh-bg" aria-hidden="true"><div className="mesh-orb" /></div>
        <div className="glass-card-premium" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px", padding: "48px 40px", textAlign: "center" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 24px",
            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Mail size={28} style={{ color: "#10b981" }} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", letterSpacing: "-0.3px" }}>Check your inbox</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: "8px" }}>
            We sent a verification link to
          </p>
          <p style={{ color: "var(--indigo-400)", fontWeight: 600, fontSize: "15px", marginBottom: "28px", wordBreak: "break-all" }}>
            {form.email}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6, marginBottom: "28px" }}>
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              color: "var(--indigo-400)", fontSize: "14px", fontWeight: 500, textDecoration: "none",
            }}
          >
            Back to sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Register Form ──────────────────────────
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="mesh-bg" aria-hidden="true"><div className="mesh-orb" /></div>

      <div className="glass-card-premium" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px", padding: "48px 40px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "16px", marginBottom: "16px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
            Start managing your shifts for free
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Display name <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  className={`glass-input${errors.displayName ? " error" : ""}`}
                  placeholder="John Doe"
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                />
              </div>
              {errors.displayName && <p style={{ color: "var(--error)", fontSize: "12px", marginTop: "6px" }} role="alert">{errors.displayName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Email address
              </label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`glass-input${errors.email ? " error" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p style={{ color: "var(--error)", fontSize: "12px", marginTop: "6px" }} role="alert">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Password
              </label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`glass-input${errors.password ? " error" : ""}`}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  style={{ paddingRight: "44px" }}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password
                ? <p style={{ color: "var(--error)", fontSize: "12px", marginTop: "6px" }} role="alert">{errors.password}</p>
                : <PasswordStrength password={form.password} />
              }
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ marginTop: "8px" }}
              aria-busy={isLoading}
            >
              {isLoading
                ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Creating account…</>
                : <>Create free account <ArrowRight size={18} aria-hidden="true" /></>
              }
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", marginTop: "28px", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--indigo-400)", fontWeight: 500, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
