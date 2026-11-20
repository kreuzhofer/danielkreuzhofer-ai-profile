/**
 * The 90-Tage AI Win offer (5.900 €) is no longer published.
 * /coaching 301-redirects to the home page.
 *
 * Relative Location on purpose: request.url carries the internal host behind the
 * reverse proxy (https://localhost:8087), so an absolute target would leak it.
 */
export function GET() {
  return new Response(null, { status: 301, headers: { Location: '/' } });
}
