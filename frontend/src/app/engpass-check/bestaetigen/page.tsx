import type { Metadata } from "next";
import { Anton } from "next/font/google";
import Link from "next/link";
import { confirmByToken } from "@/lib/engpass-check/confirm";
import "../engpass-check.css";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });

// Confirmation mutates state — never prerender/prefetch-execute it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bestätigung | Der Engpass-Check",
  robots: { index: false, follow: false },
};

export default async function BestaetigenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let reportUrl: string | null = null;
  if (token) {
    try {
      const outcome = await confirmByToken(token);
      if (outcome.status === "confirmed" || outcome.status === "already") {
        reportUrl = outcome.reportUrl;
      }
    } catch {
      reportUrl = null;
    }
  }

  return (
    <div className={`${anton.variable} engpass-check`}>
      <div className="ec-shell">
        <header className="ec-topbar">
          <Link href="/" className="ec-brand" aria-label="Zur Startseite von Daniel Kreuzhofer">
            <span className="ec-brand-name">KI-Coaching mit Kante</span>
            <span className="ec-brand-author">Daniel Kreuzhofer</span>
          </Link>
        </header>
        <main className="ec-main">
          <section className="ec-card ec-intro">
            {reportUrl ? (
              <>
                <p className="ec-eyebrow">Bestätigt</p>
                <h1 className="ec-display">Geschafft.</h1>
                <p className="ec-lead">
                  Deine Anmeldung steht. Deinen ausführlichen Report samt Umsetzungs-Toolkit habe ich
                  Dir gerade per E-Mail geschickt — Du kannst ihn auch direkt hier öffnen:
                </p>
                <a className="ec-btn ec-btn-primary" href={reportUrl}>
                  → Deinen Report &amp; das Toolkit öffnen
                </a>
              </>
            ) : (
              <>
                <p className="ec-eyebrow">Bestätigung</p>
                <h1 className="ec-display">Link ungültig</h1>
                <p className="ec-lead">
                  Dieser Bestätigungslink ist ungültig oder abgelaufen. Mach den Engpass-Check einfach
                  noch einmal — dann schicke ich Dir einen frischen Link.
                </p>
                <Link className="ec-btn ec-btn-primary" href="/engpass-check">
                  → Zum Engpass-Check
                </Link>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
