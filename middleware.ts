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
    // XHR/fetch to the API (any HTTPS host — the API origin varies per env) + WS.
    `connect-src 'self' https: wss:`,
    // reCAPTCHA + Google sign-in iframes.
    `frame-src 'self' https://www.google.com https://accounts.google.com`,
    // High-impact lockdowns (safe — don't affect app functionality):
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
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
