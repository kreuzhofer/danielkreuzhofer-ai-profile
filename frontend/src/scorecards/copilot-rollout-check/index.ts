import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import type { Answers, ScorecardResult } from "@/lib/scorecard/types";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import { RolloutResultView } from "./RolloutResultView";

/** K3-Antworten, die einen vorqualifizierten Programm-Lead markieren (Zustand A/B). */
const HOT_COPILOT_STAND = new Set(["rollout-geplant", "gekauft-kaum-genutzt"]);

/**
 * CleverReach tags — the hot flag lives HERE, not in the engine (Bau-Anweisung 4):
 * always `copilot-stand:<K3>` + `bremse:<K4>`; `rollout-hot` exactly when
 * qualified AND K3 ∈ {rollout-geplant, gekauft-kaum-genutzt} AND Score ≤ 50.
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
  return out;
}

export const copilotRolloutCheck: ScorecardRegistration = {
  definition,
  content,
  branding,
  ResultView: RolloutResultView,
  cleverreachTags: tags,
  meta: {
    title: "Copilot-Rollout-Check: Welche der vier Entscheidungen sind bei euch offen?",
    description:
      "8 Fragen, 2 Minuten: Danach weißt Du, welche der vier Rollout-Entscheidungen bei euch noch " +
      "offen sind, und bekommst die offenen als fertig formulierte Aufträge für Deine IT. Stand " +
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
