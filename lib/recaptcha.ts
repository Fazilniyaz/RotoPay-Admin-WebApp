// lib/recaptcha.ts
// ─────────────────────────────────────────────
// Google reCAPTCHA v3 (frictionless web bot mitigation, blueprint point 4).
// Lazily loads the v3 script and returns an action-scoped token that the backend
// verifies. No-op (returns null) when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is unset, so
// dev / un-keyed environments keep working.
//
// The script is injected from app code, which is nonce-trusted by our CSP, so
// `strict-dynamic` allows it (see middleware.ts).
// ─────────────────────────────────────────────

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let loaderPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.grecaptcha) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('reCAPTCHA failed to load'));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

// Get a reCAPTCHA v3 token for an action (e.g. "login"). Returns null when not
// configured or on any failure — the caller/back-end decides how strict to be.
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!SITE_KEY) return null;
  try {
    await loadScript();
    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve).catch(reject);
      });
    });
  } catch {
    return null;
  }
}
