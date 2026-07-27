import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import type { Answers, ScorecardResult } from "@/lib/scorecard/types";
import { definition } from "./definition";
import { content, DIMENSIONEN } from "./content";
import { branding } from "./branding";
import { RolloutResultView } from "./RolloutResultView";

/** K3-Antworten, die einen vorqualifizierten Programm-Lead markieren (Zustand A/B). */
const HOT_COPILOT_STAND = new Set(["rollout-geplant", "gekauft-kaum-genutzt"]);

/** Die Nutzungs-Kategorien (N1–N4), abgeleitet statt dupliziert; Summe speist nutzung-hot. */
const NUTZUNG_CATEGORIES = DIMENSIONEN.filter((d) => d.block === "nutzung").map((d) => d.category);
const NUTZUNG_HOT_MAX = 6; // ≤ die Hälfte von 12 Nutzungs-Punkten

/**
 * CleverReach tags — the hot flags live HERE, not in the engine (Bau-Anweisung 4):
 * always `copilot-stand:<K3>` + `bremse:<K4>`.
 * `rollout-hot` (#09-Lead, unverändert seit v1): qualified AND K3 ∈
 * {rollout-geplant, gekauft-kaum-genutzt} AND Gesamt-Score ≤ 50.
 * `nutzung-hot` (#10-Lead, v2): qualified AND K3 = gekauft-kaum-genutzt AND
 * Nutzungs-Block ≤ 6/12 — fängt den sauber-eingeführt-aber-ungenutzt-Lead,
 * der am Gesamt-Score vorbeirutscht. Ein Lead kann beide Tags tragen.
 */
function tags(result: ScorecardResult, answers: Answers): string[] {
  const out: string[] = [];
  const stand = answers.K3;
  const bremse = answers.K4;
  if (typeof stand === "string") out.push(`copilot-stand:${stand}`);
  if (typeof bremse === "string") out.push(`bremse:${bremse}`);

  if (
    result.qualified &&
    typeof stand === "string" &&
    HOT_COPILOT_STAND.has(stand) &&
    result.score <= 50
  ) {
    out.push("rollout-hot");
  }
  const nutzungSum = NUTZUNG_CATEGORIES.reduce(
    (sum, c) => sum + (result.categoryScores?.[c] ?? 0),
    0,
  );
  if (result.qualified && stand === "gekauft-kaum-genutzt" && nutzungSum <= NUTZUNG_HOT_MAX) {
    out.push("nutzung-hot");
  }
  return out;
}

export const copilotRolloutCheck: ScorecardRegistration = {
  definition,
  content,
  branding,
  ResultView: RolloutResultView,
  cleverreachTags: tags,
  meta: {
    title: "Copilot-Rollout-Check: Läuft Copilot bei euch nur, oder liefert er?",
    description:
      "12 Fragen, 3 Minuten: Danach weißt Du, ob Copilot bei euch sauber eingeführt ist und " +
      "wirklich genutzt wird, mit fertig formulierten Aufträgen für Deine IT und für Dich. Stand " +
      "der Recherche Juli 2026.",
  },
  doiSubject: "Ein Klick noch, dann kommt Dein Auftrags-Paket",
  deliverySubject: "Dein Auftrags-Paket ist da",
  cleverreachSource: "copilot-rollout-check",
  // Pinned explicitly instead of relying on the slug default: the ConversionLink
  // code in trackmysales must be created under exactly this name (Daniels
  // manueller Schritt nach dem Merge). A later slug change would otherwise
  // silently drop attribution — same trap the dsgvo-check hit in 60b454a.
  trackmysalesCode: "copilot-rollout-check",
  bookingUrl: "https://calendly.com/danielkreuzhofer/30min",
};
