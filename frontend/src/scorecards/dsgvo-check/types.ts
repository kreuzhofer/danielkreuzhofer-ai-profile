import type { ScorecardResult } from "@/lib/scorecard/types";

export type Verdict = "gruen" | "gelb" | "rot";
export type Ampel = Verdict;
export type RiskClass = "minimal" | "begrenzt" | "hoch";
/** Global tier chosen by the user (Q_TIER). */
export type Tier = "free" | "business" | "cloud" | "gemischt";

export interface TierFact {
  verdict: Verdict;
  reason: string;
  upgradePath?: string;
  dpaUrl?: string;
}

export interface ToolFact {
  label: string;
  vendor: string;
  country: string;
  isEU: boolean;
  /** US-hosted direct offering (drives the SCCs/TIA action when DPF is unstable). */
  usDirect: boolean;
  /** Open tier map keyed by tier-id; not every tool has every tier. */
  tiers: Partial<Record<Exclude<Tier, "gemischt">, TierFact>>;
  /** Per-tool override that beats tier + global overlays (DeepSeek, local). */
  override?: { verdict: Verdict; reason: string };
  /** Time-sensitive note surfaced as a caveat (e.g. pending acquisition). */
  caveat?: string;
  source: { url: string; asOf: string };
}

export interface ToolVerdict {
  toolId: string;
  label: string;
  verdict: Verdict;
  reason: string;
  upgradePath?: string;
  dpaUrl?: string;
  caveat?: string;
}

export interface ActionItem {
  priority: number; // lower = more urgent
  title: string;
  detail: string;
}

export interface DsgvoResult extends ScorecardResult {
  ampel: Ampel;
  toolMatrix: ToolVerdict[];
  riskClass: RiskClass;
  riskObligations: string[];
  actionPlan: ActionItem[];
  shadowAiFlag: boolean;
  usTransferFlag: boolean;
  rechtsstand: string;
}
