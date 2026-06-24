import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import type { Answers, ScorecardResult } from "@/lib/scorecard/types";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";
import { recommend } from "./recommend";
import { DsgvoResultView } from "./DsgvoResultView";
import { DsgvoReportDoc } from "./DsgvoReportDoc";
import type { DsgvoResult } from "./types";

function tags(result: ScorecardResult, answers: Answers): string[] {
  const r = result as DsgvoResult;
  const out = [`ampel:${r.ampel}`, `risk:${r.riskClass}`];
  const tools = Array.isArray(answers.Q_TOOLS) ? answers.Q_TOOLS : [];
  for (const t of tools) out.push(`tool:${t}`);
  return out;
}

export const dsgvoCheck: ScorecardRegistration = {
  definition,
  content,
  branding,
  resolve: recommend,
  ResultView: DsgvoResultView,
  ReportDoc: DsgvoReportDoc,
  cleverreachTags: tags,
  meta: {
    title: "DSGVO-Check — darfst Du Deine KI-Tools rechtssicher nutzen?",
    description: "8 Fragen, 3 Minuten: pro Tool eine klare Ampel und ein konkreter Maßnahmenplan, wie Du KI DSGVO-konform einsetzt. Stand der Recherche Juni 2026.",
  },
  doiSubject: "Ein Klick noch, dann kommt Dein DSGVO-Report",
  deliverySubject: "Dein DSGVO-Report ist da",
  cleverreachSource: "dsgvo-check",
  bookingUrl: "https://calendly.com/danielkreuzhofer/30min",
};
