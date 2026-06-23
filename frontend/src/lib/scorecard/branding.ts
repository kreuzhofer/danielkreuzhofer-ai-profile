/**
 * Brand tokens → CSS custom properties. One generic stylesheet (sc.css) reads
 * these vars, so each scorecard themes itself by supplying values only.
 */
import type { CSSProperties } from "react";

export interface BrandTokens {
  bg: string;
  surface: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentInk: string;
  brandName: string;
  brandAuthor: string;
}

/** Map tokens to the `--sc-*` custom properties for the shell's inline style. */
export function brandStyle(b: BrandTokens): CSSProperties {
  return {
    ["--sc-bg" as string]: b.bg,
    ["--sc-surface" as string]: b.surface,
    ["--sc-ink" as string]: b.ink,
    ["--sc-ink-muted" as string]: b.inkMuted,
    ["--sc-accent" as string]: b.accent,
    ["--sc-accent-ink" as string]: b.accentInk,
  };
}
