"use client";

/** Triggers the browser print dialog for the light report document → "Als PDF speichern". */
export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="scd-print-btn" onClick={() => window.print()} aria-label={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 18 15 15" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
