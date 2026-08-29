jest.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: URL, status: number) => ({
      status,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'location' ? url.toString() : null,
      },
    }),
  },
}));

import { GET } from './route';

describe('/coaching 301 redirect (offer offline)', () => {
  it('redirects GET /coaching to the home page with 301', async () => {
    const request = { url: 'https://danielkreuzhofer.de/coaching' } as Request;
    const response = await GET(request);
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://danielkreuzhofer.de/');
  });
});
