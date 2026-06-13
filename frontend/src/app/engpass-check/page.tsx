import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { EngpassCheck } from "./EngpassCheck";
import "./engpass-check.css";

/**
 * Engpass-Check — interaktive Scorecard (Lead-Magnet zu Video #05).
 *
 * Reine Regel-Strecke, client-side (kein LLM zur Laufzeit). Ergebnis erscheint
 * sofort ohne Anmeldung; erst das Opt-in schickt E-Mail + Antworten an CleverReach.
 * Brand: Video-Brand-Kit §4 (Orange/Cyan, fast-schwarzer Hintergrund, Anton-Headline).
 */

// Condensed headline font per Brand-Kit §5 (Anton — ALLCAPS, super-bold).
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "Der Engpass-Check | Daniel Kreuzhofer",
  description:
    "11 Fragen, 3 Minuten: Finde heraus, wo Dein Vertriebsprozess wirklich hängt, " +
    "welcher Engpass-Typ bei euch dominiert — und welcher Lösungsweg passt. Ergebnis sofort, ohne Anmeldung.",
  openGraph: {
    title: "Der Engpass-Check",
    description:
      "11 Fragen, 3 Minuten. Wo hängt Dein Vertriebsprozess wirklich? Ergebnis sofort, ohne Anmeldung.",
    type: "website",
  },
};

export default function EngpassCheckPage() {
  return (
    <div className={`${anton.variable} engpass-check`}>
      <EngpassCheck />
    </div>
  );
}
