"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyEmail, resendVerification } from "@/store/slices/authSlice";

type Status = "loading" | "success" | "error" | "expired" | "no-token";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);

  const token = searchParams.get("token");

  const doVerify = useCallback(async () => {
    if (!token) { setStatus("no-token"); return; }
    setStatus("loading");

    const result = await dispatch(verifyEmail(token));

    if (verifyEmail.fulfilled.match(result)) {
      setStatus("success");
      setMessage(result.payload as string);
      setTimeout(() => router.push("/login"), 4000);
    } else {
      const msg = (result.payload as string) ?? "";
      if (msg.toLowerCase().includes("expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
      }
      setMessage(msg);
    }
  }, [token, dispatch, router]);

  useEffect(() => { doVerify(); }, [doVerify]);

  async function handleResend() {
    if (!resendEmail) return;
    const result = await dispatch(resendVerification(resendEmail));
    if (resendVerification.fulfilled.match(result)) {
      setResendSent(true);
    }
  }

  const states: Record<Status, React.ReactNode> = {
    loading: (
      <>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 24px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={28} style={{ color: "#6366f1" }} className="animate-spin" />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Verifying your email…</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>This will only take a moment.</p>
      </>
    ),
    success: (
      <>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 24px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={28} style={{ color: "#10b981" }} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Email verified!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
          Your account is active. Redirecting to login in a few seconds…
        </p>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--indigo-400)", fontWeight: 500, textDecoration: "none", fontSize: "14px" }}>
          Go to sign in now <ArrowRight size={14} />
        </Link>
      </>
    ),
    expired: (
      <>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 24px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <XCircle size={28} style={{ color: "#f59e0b" }} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Link expired</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
          Verification links are valid for 24 hours. Request a new one below.
        </p>
        {!resendSent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="email"
              className="glass-input"
              placeholder="Enter your email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              style={{ paddingLeft: "16px" }}
            />
            <button onClick={handleResend} disabled={isLoading || !resendEmail} className="btn-primary">
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><RefreshCw size={16} /> Resend verification email</>}
            </button>
          </div>
        ) : (
          <p style={{ color: "#10b981", fontSize: "14px" }}>✓ A new verification email has been sent.</p>
        )}
      </>
    ),
    error: (
      <>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 24px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <XCircle size={28} style={{ color: "#ef4444" }} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Verification failed</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>{message || "This link is invalid or has already been used."}</p>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--indigo-400)", fontWeight: 500, textDecoration: "none", fontSize: "14px" }}>
          Back to sign in <ArrowRight size={14} />
        </Link>
      </>
    ),
    "no-token": (
      <>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 24px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <XCircle size={28} style={{ color: "#ef4444" }} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Invalid link</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>No verification token found. Please use the link from your email.</p>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--indigo-400)", fontWeight: 500, textDecoration: "none", fontSize: "14px" }}>
          Back to sign in <ArrowRight size={14} />
        </Link>
      </>
    ),
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="mesh-bg" aria-hidden="true"><div className="mesh-orb" /></div>
      <div className="glass-card-premium" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px", padding: "48px 40px", textAlign: "center" }}>
        {states[status]}
      </div>
    </div>
  );
}
