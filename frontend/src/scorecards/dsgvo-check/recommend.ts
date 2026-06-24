import type { Answers } from "@/lib/scorecard/types";
import { isQualified } from "@/lib/scorecard/qualification";
import { TOOLS, DPF_STATUS, RECHTSSTAND } from "./facts";
import { definition } from "./definition";
import type { ActionItem, Ampel, DsgvoResult, RiskClass, TierFact, ToolFact, ToolVerdict, Tier, Verdict } from "./types";

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
    // DPF instability is NOT a verdict overlay: facts.ts already encodes US-transfer
    // risk per tier (Claude API-direct = gelb; EU-residency tiers = gruen). It is
    // surfaced as the SCCs+TIA action item instead (see buildActionPlan / usTransfer).
    // No upgrade hint on an already-green verdict — even in "gemischt" mode — so the
    // matrix never shows "Konform nutzbar → wechsle auf eine konforme Stufe".
    const upgradePath =
      verdict === "gruen"
        ? undefined
        : tier === "gemischt"
          ? (t.upgradePath ?? "Auf eine konforme Stufe/EU-Region wechseln.")
          : t.upgradePath;
    return { toolId, label: fact.label, verdict, reason: t.reason, upgradePath, dpaUrl: t.dpaUrl, caveat: fact.caveat };
  });
}

const HIGH_RISK = new Set(["hr", "entscheidungen"]);
const LIMITED = new Set(["bot"]);

export function classifyRisk(answers: Answers): { riskClass: RiskClass; obligations: string[] } {
  const uses = asArray(answers.Q_USECASE);
  if (uses.some((u) => HIGH_RISK.has(u))) {
    return {
      riskClass: "hoch",
      obligations: [
        "Risikomanagement-System und technische Dokumentation aufbauen.",
        "Human Oversight sicherstellen (Mensch entscheidet, nicht die KI allein).",
        "Logging der Systemnutzung ≥ 6 Monate.",
        "Hochrisiko-Pflichten greifen ab 02.12.2027 (Annex III, via Digital Omnibus verschoben) — Vorbereitung jetzt.",
      ],
    };
  }
  if (uses.some((u) => LIMITED.has(u))) {
    return {
      riskClass: "begrenzt",
      obligations: ["Transparenzpflicht (Art. 50): Nutzer müssen erkennen, dass sie mit KI sprechen — ab 02.08.2026."],
    };
  }
  return {
    riskClass: "minimal",
    obligations: ["Keine spezifischen AI-Act-Pflichten — die DSGVO gilt trotzdem (AVV, Rechtsgrundlage, EU-Region)."],
  };
}

/** Compliance item id → action shown when the user did NOT check it. Order = priority. */
const COMPLIANCE_ACTIONS: { id: string; title: string; detail: string }[] = [
  { id: "literacy", title: "AI-Literacy-Schulung durchführen", detail: "Pflicht seit 02/2025 (Art. 4 EU AI Act) für alle, die KI nutzen — auch KMU." },
  { id: "avv", title: "AVV/DPA mit jedem Anbieter abschließen", detail: "Art. 28 DSGVO: ohne Auftragsverarbeitungsvertrag keine zulässige Verarbeitung." },
  { id: "richtlinie", title: "KI-Nutzungsrichtlinie erstellen", detail: "Welche Tools erlaubt sind, welche Daten rein dürfen, wer verantwortlich ist." },
  { id: "euregion", title: "EU-Region + Training-Opt-out aktivieren", detail: "Wo wählbar EU-Datenverarbeitung; Training vertraglich und technisch ausschalten." },
  { id: "dsfa", title: "DSFA durchführen, wo nötig", detail: "Datenschutz-Folgenabschätzung (Art. 35) für KI mit personenbezogenen Daten." },
];

export function buildActionPlan(answers: Answers): ActionItem[] {
  const done = new Set(asArray(answers.Q_COMPLIANCE));
  const matrix = buildToolMatrix(answers);
  const items: ActionItem[] = [];
  let p = 0;
  for (const a of COMPLIANCE_ACTIONS) {
    if (!done.has(a.id)) items.push({ priority: p++, title: a.title, detail: a.detail });
  }
  for (const v of matrix) {
    if (v.verdict !== "gruen" && v.upgradePath) {
      items.push({ priority: p++, title: `${v.label}: konform machen`, detail: v.upgradePath });
    }
  }
  const hasUs = matrix.some((v) => v.verdict !== "rot" && TOOLS[v.toolId]?.usDirect === true);
  if (!DPF_STATUS.stable && hasUs) {
    items.push({ priority: p++, title: "SCCs + Transfer Impact Assessment für US-Anbieter", detail: "Das DPF ist instabil — Standardvertragsklauseln vereinbaren und ein TIA dokumentieren." });
  }
  // Anything other than a clear "ja" → remediation (matches recommend()'s shadowAiFlag).
  const shadow = typeof answers.Q_SHADOW === "string" ? answers.Q_SHADOW : "";
  if (shadow !== "ja") {
    items.push({ priority: p++, title: "Schatten-KI eindämmen", detail: "Erfassen, welche Tools Mitarbeitende real nutzen; freigegebene Alternativen anbieten (private Accounts haben oft Training-Opt-in)." });
  }
  return items;
}

function usTransfer(answers: Answers): boolean {
  return buildToolMatrix(answers).some((v) => v.verdict !== "rot" && TOOLS[v.toolId]?.usDirect === true);
}

/** Readiness 0..100 + ampel, from tier fit, data sensitivity, shadow overview, compliance done. */
function readiness(answers: Answers): { score: number; ampel: Ampel } {
  const matrix = buildToolMatrix(answers);
  const reds = matrix.filter((v) => v.verdict === "rot").length;
  const yellows = matrix.filter((v) => v.verdict === "gelb").length;
  const doneCount = asArray(answers.Q_COMPLIANCE).filter((x) => x !== "nichts").length;
  const shadowOk = answers.Q_SHADOW === "ja";
  let score = 40 + doneCount * 10 + (shadowOk ? 15 : 0) - reds * 20 - yellows * 8;
  score = Math.max(0, Math.min(100, score));
  const ampel: Ampel = reds > 0 || score < 34 ? "rot" : score < 67 ? "gelb" : "gruen";
  return { score, ampel };
}

export function recommend(answers: Answers): DsgvoResult {
  const toolMatrix = buildToolMatrix(answers);
  const { riskClass, obligations } = classifyRisk(answers);
  const actionPlan = buildActionPlan(answers);
  const { score, ampel } = readiness(answers);
  const shadow = typeof answers.Q_SHADOW === "string" ? answers.Q_SHADOW : "";
  return {
    rawSum: 0,
    score,
    outcome: ampel,
    qualified: isQualified(definition, answers),
    ampel,
    toolMatrix,
    riskClass,
    riskObligations: obligations,
    actionPlan,
    shadowAiFlag: shadow !== "ja",
    usTransferFlag: usTransfer(answers),
    rechtsstand: RECHTSSTAND,
  };
}
