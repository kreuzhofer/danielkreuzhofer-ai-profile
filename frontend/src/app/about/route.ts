/**
 * The profile is the home page again (coaching offer offline).
 * /about 301-redirects to / so existing links keep working.
 *
 * Relative Location on purpose: request.url carries the internal host behind the
 * reverse proxy (https://localhost:8087), so an absolute target would leak it.
 */
export function GET() {
  return new Response(null, { status: 301, headers: { Location: '/' } });
}
