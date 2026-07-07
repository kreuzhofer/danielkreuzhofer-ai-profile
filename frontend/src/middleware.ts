/**
 * Security middleware.
 *
 * Generates a per-request nonce for Content-Security-Policy and applies the
 * strict CSP + security headers (VULN-003). The nonce is forwarded to the
 * App Router via the `x-nonce` request header so layouts can pass it to
 * inline scripts; Next.js auto-applies it to its own inline hydration scripts
 * when the header is present.
 *
 * Headers are applied to every route. CSP only affects rendered HTML pages
 * (API routes returning JSON/SSE are unaffected).
 */

import { NextResponse, type NextRequest } from 'next/server';

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== 'production';

  // In dev, Next.js HMR uses eval(); in prod, strict nonce-based script-src.
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Forward the nonce to the App Router so Next.js can apply it to its inline
  // hydration scripts and layouts can pass it to custom <Script> tags.
  const requestHeaders = new Headers(request.headers);
  if (!isDev) {
    requestHeaders.set('x-nonce', nonce);
  }
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Apply CSP + static security headers to the response.
  response.headers.set('Content-Security-Policy', csp);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  // Apply to all routes except static asset files.
  matcher: ['/((?!.*\\.).*)'],
};
