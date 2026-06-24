import type { ToolFact } from "./types";

/** Rechtsstand — drives the Aktualitäts-Badge. Bump on every fact refresh. */
export const RECHTSSTAND = "2026-06";

/** DPF: valid but unstable (PCLOB no quorum, FISA-702 45-day, Latombe CJEU appeal). */
export const DPF_STATUS = {
  valid: true,
  stable: false,
  note: "DPF gilt, ist aber instabil (PCLOB ohne Quorum, FISA-702 nur verlängert, Latombe-Berufung am CJEU ohne Termin). EU-Residenz bevorzugen, SCCs+TIA als Fallback.",
  asOf: "2026-06",
} as const;

export const AI_ACT_TIMELINE = [
  { date: "2025-02-02", item: "Verbotene Praktiken (Art. 5)", status: "in Kraft; Omnibus ergänzt Deepfake-/CSAM-Verbote" },
  { date: "2025-02-02", item: "KI-Literacy-Pflicht (Art. 4)", status: "in Kraft; gilt für alle Betreiber, auch KMU" },
  { date: "2025-08-02", item: "GPAI-Pflichten (Art. 51–55)", status: "in Kraft (Modell-Anbieter)" },
  { date: "2027-12-02", item: "Hochrisiko Annex III (u.a. Beschäftigung/HR)", status: "verschoben via Digital Omnibus (Parlament 16.06.2026); Ratifikation ~Juli 2026 ausstehend" },
  { date: "2028-08-02", item: "Hochrisiko Annex I (Produkte)", status: "verschoben via Digital Omnibus" },
  { date: "2026-08-02", item: "Transparenzpflicht (Art. 50, Basis)", status: "in Kraft; Wasserzeichenpflicht → 2026-12-02" },
] as const;

export const TOOLS: Record<string, ToolFact> = {
  chatgpt: {
    label: "ChatGPT (OpenAI)", vendor: "OpenAI", country: "USA", isEU: false, usDirect: true,
    tiers: {
      free: { verdict: "rot", reason: "Kein vollwertiger AVV, keine EU-Inferenz, Verarbeitung in den USA.", upgradePath: "Auf Team/Enterprise/API mit EU-Region wechseln." },
      business: { verdict: "gruen", reason: "Enterprise/API mit EU-Data-Residency + EU-Inferenz (seit Jan. 2026); DPA aktiv konfigurieren.", dpaUrl: "https://openai.com/de-DE/index/introducing-data-residency-in-europe/" },
      cloud: { verdict: "gruen", reason: "Azure OpenAI „Data Zone Standard (EUR)“; Microsoft DPA automatisch.", dpaUrl: "https://learn.microsoft.com/en-au/answers/questions/2262985/azure-openai-service-in-europe" },
    },
    source: { url: "https://openai.com/de-DE/index/introducing-data-residency-in-europe/", asOf: "2026-04" },
  },

  claude: {
    label: "Anthropic Claude", vendor: "Anthropic", country: "USA", isEU: false, usDirect: true,
    tiers: {
      free: { verdict: "rot", reason: "Consumer Free/Pro/Max (claude.ai): Training-Default seit 08.10.2025 auf Opt-in geändert; kein vollwertiger AVV; für betriebliche Nutzung mit Personenbezug ungeeignet.", upgradePath: "Auf API direkt / Team / Enterprise oder Cloud-Deployment wechseln." },
      business: { verdict: "gelb", reason: "API direkt / Team / Enterprise: US-Standard ohne dediziertes EU-Hosting; DPA automatisch in Commercial Terms (seit 01.01.2026) + SCCs Modul 2/3; 7-Tage-Retention; DSFA + TIA erforderlich.", upgradePath: "Über AWS Bedrock (Frankfurt) oder Google Vertex AI (EU) wird's grün.", dpaUrl: "https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa" },
      cloud: { verdict: "gruen", reason: "AWS Bedrock eu-central-1 (Frankfurt) oder Google Vertex AI EU-Region: vollständige EU-Datenresidenz, kein Training mit Kundendaten, AWS/Google DPA automatisch.", dpaUrl: "https://compound.law/en-DE/tools/claude-eu-hosting/" },
    },
    source: { url: "https://companyscope.io/vendors/anthropic", asOf: "2026-04-29" },
  },

  gemini: {
    label: "Google Gemini", vendor: "Google", country: "USA", isEU: false, usDirect: true,
    tiers: {
      free: { verdict: "rot", reason: "Consumer-Version (gemini.google.com) ohne Unternehmens-DPA; nicht für Unternehmensdaten geeignet.", upgradePath: "Google Workspace Business/Enterprise oder Vertex AI EU nutzen." },
      business: { verdict: "gruen", reason: "Google Workspace Business/Enterprise: EU-Region, Workspace DPA automatisch eingebunden, kein Training mit Workspace-Daten.", dpaUrl: "https://www.aipolicydesk.com/blog/ai-vendor-dpa-tracker-2026" },
      cloud: { verdict: "gruen", reason: "Vertex AI EU-Region (europe-west3/4): EU-Multi-Region, Google Cloud DPA automatisch, kein Training per Default; ISO 27001/27701 zertifiziert.", dpaUrl: "https://cloud.google.com/privacy/gdpr" },
    },
    source: { url: "https://innfactory.ai/en/ai-models/google-gemini/", asOf: "2026-06-08" },
  },

  copilot: {
    label: "Microsoft Copilot", vendor: "Microsoft", country: "USA", isEU: false, usDirect: true,
    tiers: {
      free: { verdict: "rot", reason: "Consumer-Version ohne Unternehmens-DPA.", upgradePath: "M365 Copilot (Business) lizenzieren." },
      business: { verdict: "gelb", reason: "„Flex Routing“ (Default seit 17.04.2026) kann Inferenz in USA/Kanada/Australien verlagern; Anthropic-Subprozessor außerhalb der EU Data Boundary.", upgradePath: "Flex Routing im M365 Admin Center deaktivieren.", dpaUrl: "https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA" },
    },
    source: { url: "https://www.privacyofficers.at/wie-microsoft-die-eu-datengrenze-fur-copilot-stillschweigend-aufweicht/", asOf: "2026-04" },
  },

  mistral: {
    label: "Mistral / Le Chat", vendor: "Mistral AI", country: "Frankreich", isEU: true, usDirect: false,
    tiers: {
      business: { verdict: "gruen", reason: "Le Chat Pro/Team: EU-native (Paris), kein Training für kommerzielle Nutzer per Default, DPA auf mistral.ai/terms verfügbar.", dpaUrl: "https://legal.mistral.ai/terms/data-processing-addendum" },
      cloud: { verdict: "gruen", reason: "Mistral API direkt: EU-native, kein US-Routing, kein Training per Default.", dpaUrl: "https://www.waimakers.com/en/resources/gdpr-compliance/mistral-ai" },
    },
    caveat: "Bei Cloud-Bezug über US-Marktplätze (Azure/GCP) US-Routing prüfen; Le Chat Free hat Opt-out-Training.",
    source: { url: "https://www.waimakers.com/en/resources/gdpr-compliance/mistral-ai", asOf: "2026-06" },
  },

  alephalpha: {
    label: "Aleph Alpha / PhariaAI", vendor: "Aleph Alpha", country: "Deutschland", isEU: true, usDirect: false,
    tiers: {
      business: { verdict: "gruen", reason: "Enterprise / On-Premise / STACKIT-as-a-Service: vollständig EU (Deutschland), individueller AVV, keine Drittlandtransfers; BSI-Zertifizierungen; ideal für regulierte Branchen.", dpaUrl: "https://aleph-alpha.com/de/aleph-alpha-stellt-phariaai-vor/" },
    },
    caveat: "Cohere-Übernahme angekündigt 24.04.2026 (unter Genehmigungsvorbehalt) — post-Merger DSGVO-Einordnung neu bewerten.",
    source: { url: "https://europeanstack.com/software/aleph-alpha", asOf: "2026-03-05" },
  },

  deepseek: {
    label: "DeepSeek", vendor: "DeepSeek", country: "China", isEU: false, usDirect: false,
    tiers: {},
    override: { verdict: "rot", reason: "Datenspeicherung in China, kein Angemessenheitsbeschluss; Garante-Ban seit 30.01.2025; EU-Ermittlungen in Deutschland, Frankreich, Niederlanden, Belgien und Irland." },
    source: { url: "https://www.euronews.com/next/2025/01/31/deepseek-ai-blocked-by-italian-authorities-as-others-member-states-open-probes", asOf: "2025-01-30" },
  },

  local: {
    label: "Lokale Modelle (Ollama / vLLM / llama.cpp)", vendor: "Self-Hosted", country: "EU (self-hosted)", isEU: true, usDirect: false,
    tiers: {},
    override: { verdict: "gruen", reason: "Self-Hosted in eigener EU-Infrastruktur; keine Auftragsverarbeitung; DSGVO-Pflichten (ROPA, TOMs, ggf. DSFA) bleiben beim Unternehmen." },
    source: { url: "https://www.qytera.de/blog/compliance-sichere-ai-fuer-unternehmen", asOf: "2026-04-20" },
  },
};

/** Tools a user can select (Q_TOOLS) that we have facts for. */
export const KNOWN_TOOL_IDS = Object.keys(TOOLS);
