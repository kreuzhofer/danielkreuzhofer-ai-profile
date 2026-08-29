import { NextResponse } from 'next/server';

/**
 * The 90-Tage AI Win offer (5.900 €) is no longer published.
 * /coaching 301-redirects to the top-of-funnel home page.
 */
export function GET(request: Request) {
  return NextResponse.redirect(new URL('/', request.url), 301);
}
