import type { Answers } from "@/lib/scorecard/types";
import { TOOLS, DPF_STATUS } from "./facts";
import type { TierFact, ToolFact, ToolVerdict, Tier, Verdict } from "./types";

const ORDER: Verdict[] = ["gruen", "gelb", "rot"];
const worse = (a: Verdict, b: Verdict): Verdict => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b);

function asArray(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/** Pick the TierFact for the chosen global tier; gemischt → least-favourable known tier. */
function pickTier(fact: ToolFact, tier: Tier): TierFact | undefined {
  if (tier !== "gemischt") return fact.tiers[tier];
  const known = Object.values(fact.tiers);
  if (known.length === 0) return undefined;
  return known.reduce((acc, t) => (ORDER.indexOf(t.verdict) > ORDER.indexOf(acc.verdict) ? t : acc));
}

export function buildToolMatrix(answers: Answers): ToolVerdict[] {
  const tier = (typeof answers.Q_TIER === "string" ? answers.Q_TIER : "gemischt") as Tier;
  const data = typeof answers.Q_DATA === "string" ? answers.Q_DATA : "keine";
  const sensitive = data === "personenbezogen" || data === "besondere";

  return asArray(answers.Q_TOOLS).filter((id) => id !== "keine").map((toolId) => {
    const fact = TOOLS[toolId];
    if (!fact) {
      return {
        toolId, label: toolId,
        verdict: "gelb" as Verdict,
        reason: "Für dieses Tool liegt keine geprüfte Einordnung vor — individuell prüfen (AVV, EU-Region, Training-Opt-out).",
      };
    }
    if (fact.override) {
      return { toolId, label: fact.label, verdict: fact.override.verdict, reason: fact.override.reason, caveat: fact.caveat };
    }
    const t = pickTier(fact, tier);
    if (!t) {
      return { toolId, label: fact.label, verdict: "gelb", reason: "Für die gewählte Nutzungsform liegt keine Einordnung vor — individuell prüfen.", caveat: fact.caveat };
    }
    let verdict = t.verdict;
    if (sensitive && tier === "free") verdict = worse(verdict, "rot");
    // DPF instability only worsens tiers that already carry US-transfer risk
    // (e.g. US-routed business plans). EU-residency business tiers rated gruen
    // in the facts are not downgraded.
    if (!DPF_STATUS.stable && fact.usDirect && tier === "business" && t.verdict !== "gruen") verdict = worse(verdict, "gelb");
    return {
      toolId, label: fact.label, verdict, reason: t.reason,
      upgradePath: tier === "gemischt" ? (t.upgradePath ?? "Auf eine konforme Stufe/EU-Region wechseln.") : t.upgradePath,
      dpaUrl: t.dpaUrl, caveat: fact.caveat,
    };
  });
}
