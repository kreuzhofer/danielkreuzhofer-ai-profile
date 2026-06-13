import type { ReactNode } from "react";
import Link from "next/link";
import "./legal.css";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="legal-header-inner">
          <Link href="/" className="legal-brand" aria-label="Zur Startseite">
            <span className="legal-brand-name">Daniel Kreuzhofer</span>
            <span className="legal-brand-sub">KI-Coaching mit Kante</span>
          </Link>
          <nav className="legal-nav" aria-label="Rechtliches">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </nav>
        </div>
      </header>
      <main className="legal-container">{children}</main>
    </div>
  );
}
