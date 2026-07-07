// middleware.ts
// ─────────────────────────────────────────────
// Security headers + Content-Security-Policy (blueprint point 4).
//
// NOTE ON APPROACH: a nonce + 'strict-dynamic' CSP is the "strictest" option,
// BUT Next.js only stamps its nonce onto inline scripts on DYNAMICALLY rendered
// pages. On Vercel most pages are statically optimized, so the nonce never
// reaches those inline scripts and the whole app is blocked (works in `next dev`
// — which is always dynamic — then breaks in production). So we use a CSP that is
// COMPATIBLE with Next's static output: 'unsafe-inline' for scripts/styles, with
// everything else locked down (framing, objects, base-uri, form-action, sources).
// This still satisfies "implement a CSP" and blocks the high-impact vectors;
// tightening scripts to a nonce later requires forcing dynamic rendering + a
// dedicated preview test.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

// `next dev` runs with NODE_ENV=development; the Vercel build runs as production.
// In local dev the backend + HMR are plain HTTP/WS on localhost, so an
// HTTPS-only connect-src (+ upgrade-insecure-requests) would block every API call
// (blocked:csp). We relax ONLY connect-src (+ drop the HTTPS upgrade) in dev;
// production is left exactly as it was (which is verified working live).
const isDev = process.env.NODE_ENV !== 'production';

export function middleware(_request: NextRequest) {
  const csp = [
    `default-src 'self'`,
    // Next.js ships inline bootstrap scripts (no reliable nonce on static pages),
    // so inline is allowed; https: covers Google Identity Services + reCAPTCHA.
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`,
    `script-src-elem 'self' 'unsafe-inline' https:`,
    // Inline styles / <style> blocks + Google Fonts stylesheet.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    // Avatars (Google, ImageKit) + inline data/blob previews.
    `img-src 'self' data: blob: https:`,
    // Google Fonts font files.
    `font-src 'self' data: https://fonts.gstatic.com`,
    // XHR/fetch + WebSockets. Prod = HTTPS only; dev also allows http/ws for the
    // local backend (http://localhost:5000) and Next's HMR socket.
    isDev
      ? `connect-src 'self' http: https: ws: wss:`
      : `connect-src 'self' https: wss:`,
    // reCAPTCHA + Google sign-in iframes.
    `frame-src 'self' https://www.google.com https://accounts.google.com`,
    // High-impact lockdowns (safe — don't affect app functionality):
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // Force HTTPS in production only — in dev it would break the http localhost API.
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ].join('; ');

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // geolocation=(self): the onboarding flow auto-fills a new user's workplace
  // location from the browser's Geolocation API, so it must be allowed for our
  // own origin. An empty allowlist — geolocation=() — disables the API entirely
  // (no permission prompt, instant failure) for every browser. camera/mic stay
  // fully blocked as the app never uses them.
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), browsing-topics=()');
  // HTTPS-only for 2 years (browsers ignore this over http, so it's prod-effective).
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

export const config = {
  // Run on all pages except static assets + image optimizer + favicon.
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
