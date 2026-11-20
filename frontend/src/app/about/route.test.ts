/**
 * @jest-environment node
 */
import { GET } from './route';

describe('/about 301 redirect', () => {
  it('redirects to the home page with 301', () => {
    const response = GET();
    expect(response.status).toBe(301);
  });

  it('uses a relative Location so the public host is kept behind the reverse proxy', () => {
    // Regression: building the target from request.url resolved to the internal
    // host (https://localhost:8087/) in production.
    const response = GET();
    expect(response.headers.get('location')).toBe('/');
  });
});
