# Web App Security (Blueprint Point 4)

## Headers & CSP

`middleware.ts` sets, on every page response:

- **Content-Security-Policy** — strict, per-request **nonce** + `strict-dynamic` for scripts (Next
  auto-stamps its inline scripts; only nonce-trusted scripts and what they load run). `style-src`
  keeps `'unsafe-inline'` because the UI uses inline styles/`<style>` blocks. `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`.
  Google (OAuth + reCAPTCHA) and the API origin are allow-listed for `connect-src`/`frame-src`, and
  Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) for `style-src`/`font-src` (Montserrat +
  JetBrains Mono are `@import`ed in `globals.css`).
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
