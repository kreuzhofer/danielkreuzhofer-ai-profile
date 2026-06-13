/**
 * trackmysales visitor-id capture. Prefers ?tid= from the URL (first arrival
 * from a tracked short link), else the value persisted earlier this session.
 * Returns null when there is no valid tid. Browser-only.
 */

const TID_KEY = "engpass-check-tid";
const TID_RE = /^[A-Za-z0-9_-]{1,255}$/;

export function captureTrackingId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("tid");
    if (fromUrl && TID_RE.test(fromUrl)) {
      sessionStorage.setItem(TID_KEY, fromUrl);
      return fromUrl;
    }
    const saved = sessionStorage.getItem(TID_KEY);
    return saved && TID_RE.test(saved) ? saved : null;
  } catch {
    return null;
  }
}
