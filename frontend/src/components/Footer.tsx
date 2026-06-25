import Link from "next/link";

/** Global site footer — makes Impressum & Datenschutz reachable from every page. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-brand">© Daniel Kreuzhofer · KI-Coaching mit Kante</span>
        <nav className="site-footer-nav" aria-label="Rechtliches">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
        </nav>
        <img src="/brand/k-bug-dark.svg" alt="" aria-hidden="true" style={{ height: "18px", width: "auto" }} />
      </div>
    </footer>
  );
}
