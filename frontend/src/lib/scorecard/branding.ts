/**
 * Brand tokens → CSS custom properties. One generic stylesheet (sc.css) reads
 * these vars, so each scorecard themes itself by supplying values only. The token
 * set mirrors the Engpass-Check palette (Video-Brand-Kit §4): a near-black base
 * with surface layers, an orange primary accent and a cyan secondary accent.
 */
import type { CSSProperties } from "react";

export interface BrandTokens {
  /** Page background (darkest). */
  bg: string;
  /** Card / panel background. */
  surface: string;
  /** Raised surface (options, quote blocks). */
  surface2: string;
  /** Pill / track background (progress bar, meter). */
  pill: string;
  /** Hairline borders. */
  border: string;
  /** Primary text. */
  ink: string;
  /** Secondary / muted text. */
  inkMuted: string;
  /** Tertiary / subtle text (labels, hints). */
  inkSubtle: string;
  /** Primary accent (orange). */
  accent: string;
  /** Text/icon color on top of the primary accent. */
  accentInk: string;
  /** Secondary accent (cyan) — focus rings, links, report headers. */
  accent2: string;
  brandName: string;
  brandAuthor: string;
}

/** Map tokens to the `--sc-*` custom properties for the shell's inline style. */
export function brandStyle(b: BrandTokens): CSSProperties {
  return {
    ["--sc-bg" as string]: b.bg,
    ["--sc-surface" as string]: b.surface,
    ["--sc-surface-2" as string]: b.surface2,
    ["--sc-pill" as string]: b.pill,
    ["--sc-border" as string]: b.border,
    ["--sc-ink" as string]: b.ink,
    ["--sc-ink-muted" as string]: b.inkMuted,
    ["--sc-ink-subtle" as string]: b.inkSubtle,
    ["--sc-accent" as string]: b.accent,
    ["--sc-accent-ink" as string]: b.accentInk,
    ["--sc-accent-2" as string]: b.accent2,
  };
}
