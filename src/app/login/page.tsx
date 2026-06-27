"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, googleLogin, clearError } from "@/store/slices/authSlice";

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (n: { isNotDisplayed: () => boolean }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: { theme?: string; size?: string; width?: number; text?: string }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleInitialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  // ── Google Identity Services ──────────────────
  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      setGoogleLoading(true);
      try {
        const result = await dispatch(googleLogin(response.credential));
        if (googleLogin.fulfilled.match(result)) {
          toast.success("Welcome!");
          router.push("/dashboard");
        } else {
          toast.error((result.payload as string) || "Google sign-in failed");
        }
      } finally {
        setGoogleLoading(false);
      }
    },
    [dispatch, router]
  );

  useEffect(() => {
    if (googleInitialized.current) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleInitialized.current = true;
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) existing.remove();
    };
  }, [handleGoogleCredential]);

  function handleGoogleClick() {
    if (!window.google) {
      toast.error("Google sign-in is loading, please try again");
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      // If One Tap is blocked (e.g. by browser), fall back — but GIS prompt still works
      if (notification.isNotDisplayed()) {
        toast("Pop-up blocked — please allow pop-ups for Google sign-in", { icon: "⚠️" });
      }
    });
  }

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    } else {
      const msg = result.payload as string;
      if (msg?.toLowerCase().includes("verify")) {
        toast.error(msg, { duration: 6000 });
      } else {
        toast.error(msg || "Login failed");
      }
    }
  }

  const isAnyLoading = isLoading || googleLoading;

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {/* Animated background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb" />
      </div>

      {/* Card */}
      <div
        className="glass-card-premium"
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px", padding: "48px 40px" }}
      >
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
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
            Sign in to your RotaPay account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

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
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" style={{ color: "var(--error)", fontSize: "12px", marginTop: "6px" }} role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label htmlFor="password" style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--indigo-400)", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`glass-input${errors.password ? " error" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
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
                    display: "flex", alignItems: "center", padding: "2px",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: "var(--error)", fontSize: "12px", marginTop: "6px" }} role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isAnyLoading}
              style={{ marginTop: "8px" }}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={18} aria-hidden="true" /></>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="divider" style={{ margin: "24px 0" }}>or</div>

        {/* Google */}
        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleClick}
          disabled={isAnyLoading}
        >
          {googleLoading ? (
            <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Signing in…</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "28px", fontSize: "14px", color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--indigo-400)", fontWeight: 500, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}