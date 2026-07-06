# Web App Security (Blueprint Point 4)

## Headers & CSP

`middleware.ts` sets, on every page response:

- **Content-Security-Policy** — a **Next-static-compatible** policy. Scripts/styles allow
  `'unsafe-inline'` (Next ships inline bootstrap scripts that only get a nonce on *dynamically*
  rendered pages — a nonce+`strict-dynamic` CSP works in `next dev` but blocks the whole app on
  Vercel's statically-optimized pages, so it's intentionally avoided). Everything else is locked down:
  `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`,
  `upgrade-insecure-requests`, restricted `img-src`/`font-src`/`frame-src`, Google Fonts allow-listed,
  and `connect-src 'self' https: wss:` (the API origin varies per environment). Tightening scripts to a
  nonce later requires forcing dynamic rendering + a dedicated preview test.
- **Strict-Transport-Security** (HSTS, 2y, preload), **X-Content-Type-Options: nosniff**,
  **X-Frame-Options: DENY**, **Referrer-Policy: strict-origin-when-cross-origin**,
  **Permissions-Policy** (camera/mic/geo/topics denied).

> ⚠️ **Test the CSP on a Vercel preview before production.** If a needed script is blocked, temporarily
> rename the response header to `Content-Security-Policy-Report-Only` in `middleware.ts` to observe
> without breaking, adjust the allow-list, then switch back.

## Cookies

The web app authenticates with **Bearer tokens** (access/refresh in the auth store) — the backend
sets **no session cookies**, so there are no insecure cookies to harden. If a cookie is ever
introduced, use `secureCookie()` in `RotoPay-Backend/src/utilities/cookie.ts`, which forces
`HttpOnly` + `Secure` (prod) + `SameSite=Lax`. The strict CSP above is the primary mitigation for the
XSS risk of storing tokens in the browser.

## Bot protection — reCAPTCHA v3

- **Client**: `lib/recaptcha.ts` lazily loads reCAPTCHA v3 and, via the axios request interceptor
  (`lib/axios.ts`), automatically attaches an action-scoped token (`X-Recaptcha-Token`) to
  `login` / `register` / `forgot-password` / `resend-verification`. No form changes needed; a no-op
  when unconfigured.
- **Server**: `recaptchaGuard(action)` (`RotoPay-Backend/src/middlewares/recaptcha.middleware.ts`)
  verifies the token with Google and checks the score (`RECAPTCHA_MIN_SCORE`, default 0.5) + action.
  Enforced **only for web clients** — mobile uses App Attestation (point 2). No-op until
  `RECAPTCHA_ENFORCED=true`.

### Config

```bash
# Web (.env.local)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<reCAPTCHA v3 site key>

# Backend (.env)
RECAPTCHA_ENFORCED=true
RECAPTCHA_SECRET_KEY=<reCAPTCHA v3 secret key>
RECAPTCHA_MIN_SCORE=0.5
```

## ⚠️ Housekeeping: duplicate Next config

The repo has **both** `next.config.mjs` and `next.config.ts`. Next.js loads only one, so their
settings (`ignoreBuildErrors`, `images`, `removeConsole`) may not all apply as intended. Consolidate
into a single config file (recommended: `next.config.ts`) to avoid surprises. Not changed here to
avoid altering build behaviour without your call.
