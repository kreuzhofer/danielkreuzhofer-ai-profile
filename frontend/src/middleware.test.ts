/**
 * Security middleware tests (VULN-003).
 *
 * @jest-environment node
 */

// next/server provides NextResponse and NextRequest types. We mock NextRequest
// construction (web Request) and inspect NextResponse.next output.
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: (init?: { request?: { headers?: Headers } }) => {
        const headers = init?.request?.headers ?? new Headers();
        // Return a Response-like object with mutable headers for assertions.
        const response = new Response(null, { status: 200 });
        // Copy over request headers set by middleware (for forwarding)
        for (const [k, v] of headers.entries()) {
          if (k.toLowerCase().startsWith('x-') || k.toLowerCase() === 'content-security-policy') {
            response.headers.set(k, v);
          }
        }
        return response;
      },
    },
  };
});

import { middleware } from './middleware';

function createRequest(path = '/'): import('next/server').NextRequest {
  return new Request(`http://localhost:3000${path}`, {
    method: 'GET',
  }) as unknown as import('next/server').NextRequest;
}

function setNodeEnv(value: string): void {
  (process.env as Record<string, string>).NODE_ENV = value;
}

describe('security middleware (VULN-003)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    setNodeEnv(originalNodeEnv);
  });

  describe('security headers', () => {
    beforeEach(() => {
      setNodeEnv('production');
    });

    it('sets X-Frame-Options: DENY', async () => {
      const res = await middleware(createRequest());
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('sets X-Content-Type-Options: nosniff', async () => {
      const res = await middleware(createRequest());
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('sets Referrer-Policy', async () => {
      const res = await middleware(createRequest());
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('sets Permissions-Policy restricting camera/mic/geolocation', async () => {
      const res = await middleware(createRequest());
      const pp = res.headers.get('Permissions-Policy');
      expect(pp).toContain('camera=()');
      expect(pp).toContain('microphone=()');
      expect(pp).toContain('geolocation=()');
    });

    it('sets HSTS with includeSubDomains and preload', async () => {
      const res = await middleware(createRequest());
      const hsts = res.headers.get('Strict-Transport-Security');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    });
  });

  describe('Content-Security-Policy', () => {
    beforeEach(() => {
      setNodeEnv('production');
    });

    it('sets a CSP header', async () => {
      const res = await middleware(createRequest());
      const csp = res.headers.get('Content-Security-Policy');
      expect(csp).not.toBeNull();
    });

    it('CSP includes strict script-src with nonce in production', async () => {
      const res = await middleware(createRequest());
      const csp = res.headers.get('Content-Security-Policy')!;
      expect(csp).toContain("script-src 'self' 'nonce-");
      expect(csp).toContain("'strict-dynamic'");
      // Must NOT include 'unsafe-inline' for scripts in production.
      const scriptDirective = csp.split(';').find((d) => d.trim().startsWith('script-src'))!;
      expect(scriptDirective).not.toContain("'unsafe-inline'");
    });

    it('CSP sets frame-ancestors none (clickjacking protection)', async () => {
      const res = await middleware(createRequest());
      const csp = res.headers.get('Content-Security-Policy')!;
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('CSP sets object-src none', async () => {
      const res = await middleware(createRequest());
      const csp = res.headers.get('Content-Security-Policy')!;
      expect(csp).toContain("object-src 'none'");
    });

    it('CSP includes upgrade-insecure-requests', async () => {
      const res = await middleware(createRequest());
      const csp = res.headers.get('Content-Security-Policy')!;
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('forwards a unique nonce per request via x-nonce header', async () => {
      const res1 = await middleware(createRequest());
      const res2 = await middleware(createRequest());
      const nonce1 = res1.headers.get('x-nonce');
      const nonce2 = res2.headers.get('x-nonce');
      expect(nonce1).toBeTruthy();
      expect(nonce2).toBeTruthy();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('development mode', () => {
    beforeEach(() => {
      setNodeEnv('development');
    });

    it('allows unsafe-inline and unsafe-eval for HMR in dev', async () => {
      const res = await middleware(createRequest());
      const csp = res.headers.get('Content-Security-Policy')!;
      const scriptDirective = csp.split(';').find((d) => d.trim().startsWith('script-src'))!;
      expect(scriptDirective).toContain("'unsafe-inline'");
      expect(scriptDirective).toContain("'unsafe-eval'");
    });

    it('does not set x-nonce in dev (not needed with unsafe-inline)', async () => {
      const res = await middleware(createRequest());
      expect(res.headers.get('x-nonce')).toBeNull();
    });
  });
});
