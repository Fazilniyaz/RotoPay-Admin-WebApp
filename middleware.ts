// middleware.ts
// ─────────────────────────────────────────────
// Security headers + strict Content-Security-Policy (blueprint point 4).
//
// Uses the Next.js-recommended per-request NONCE pattern: a fresh nonce is put
// on the CSP and the request headers, and Next automatically stamps that nonce
// onto its own inline scripts. `strict-dynamic` then means only nonce-trusted
// scripts (and anything THEY load — e.g. Google Identity Services, reCAPTCHA)
// can run, so injected/inline attacker scripts are blocked. Styles keep
// 'unsafe-inline' because the app uses inline styles / <style> blocks.
//
// ⚠️ Verify on a Vercel preview before trusting it. If a needed script is
// blocked, temporarily rename the response header to
// `Content-Security-Policy-Report-Only` to observe without breaking, then adjust.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

// Origin of the backend API (for connect-src), derived from the public API URL.
function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').origin;
  } catch {
    return 'http://localhost:5000';
  }
}

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());

  const csp = [
    `default-src 'self'`,
    // Next inline scripts get the nonce; strict-dynamic trusts what they load
    // (Google Identity Services, reCAPTCHA). https: is a fallback for old browsers.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    // Inline styles / <style> blocks throughout the UI + Google Fonts stylesheet
    // (Montserrat + JetBrains Mono are pulled via @import from fonts.googleapis.com).
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    // Avatars (Google, ImageKit) + inline data/blob previews.
    `img-src 'self' data: blob: https:`,
    // Google Fonts font files are served from fonts.gstatic.com.
    `font-src 'self' data: https://fonts.gstatic.com`,
    // XHR/fetch to our API + Google (OAuth / reCAPTCHA).
    `connect-src 'self' ${apiOrigin()} https://www.google.com https://accounts.google.com`,
    // reCAPTCHA + Google sign-in iframes.
    `frame-src https://www.google.com https://accounts.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  // Expose the nonce to the app (so Next stamps its scripts) via request headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('content-security-policy', csp);
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
