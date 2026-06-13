"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/engpass-check/questions";
import { computeResult } from "@/lib/engpass-check/scoring";
import { buildReportModel } from "@/lib/engpass-check/report";
import { captureTrackingId } from "@/lib/engpass-check/tracking";
import { DATENSCHUTZ_HINWEIS, INTRO, OPTIN, RESULT } from "@/lib/engpass-check/copy";
import {
  OPTIN_TEXT,
  VIDEO_INTRO,
  VIDEO_LABEL,
  VIDEO_TITLE,
  VIDEO_URL,
} from "@/lib/engpass-check/report-content";
import { Report } from "./Report";
import type { Answers } from "@/lib/engpass-check/types";

// =============================================================================
// State
// =============================================================================

type Phase = "intro" | "quiz" | "result";

interface State {
  phase: Phase;
  index: number;
  answers: Answers;
}

type Action =
  | { type: "start" }
  | { type: "answer"; optionId: string }
  | { type: "back" }
  | { type: "restart" }
  | { type: "hydrate"; state: State };

const INITIAL_STATE: State = { phase: "intro", index: 0, answers: {} };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...state, phase: "quiz", index: 0 };
    case "answer": {
      const question = QUESTIONS[state.index];
      const answers = { ...state.answers, [question.id]: action.optionId };
      const isLast = state.index >= TOTAL_QUESTIONS - 1;
      return isLast
        ? { phase: "result", index: state.index, answers }
        : { phase: "quiz", index: state.index + 1, answers };
    }
    case "back":
      if (state.phase === "result") return { ...state, phase: "quiz", index: TOTAL_QUESTIONS - 1 };
      if (state.index > 0) return { ...state, index: state.index - 1 };
      return { ...state, phase: "intro" };
    case "restart":
      return INITIAL_STATE;
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

const STORAGE_KEY = "engpass-check-state";

// =============================================================================
// Component
// =============================================================================

export function EngpassCheck() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Capture the trackmysales visitor id (?tid) into sessionStorage on landing so
  // it survives the quiz; the opt-in reads it back at submit time. Side-effect
  // only (no React state) — nothing in the tree depends on it during render.
  useEffect(() => {
    captureTrackingId();
  }, []);

  // Restore in-progress answers after mount (client-only → no hydration mismatch).
  // sessionStorage keeps answers in the browser only — consistent with the DSGVO
  // promise that nothing leaves the device before the opt-in.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as State;
        if (parsed && typeof parsed.index === "number" && parsed.answers) {
          dispatch({ type: "hydrate", state: parsed });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    // Never persist the pristine intro state. This is what makes the restore
    // robust under React's double-invoked effects (Strict Mode / Fast Refresh):
    // the throwaway INITIAL render can't clobber an in-progress saved session.
    if (state.phase === "intro" && Object.keys(state.answers).length === 0) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [state]);

  return (
    <div className="ec-shell">
      <header className="ec-topbar">
        <Link href="/" className="ec-brand" aria-label="Zur Startseite von Daniel Kreuzhofer">
          <span className="ec-brand-name">KI-Coaching mit Kante</span>
          <span className="ec-brand-author">Daniel Kreuzhofer</span>
        </Link>
      </header>

      <main className="ec-main">
        {state.phase === "intro" && <Intro onStart={() => dispatch({ type: "start" })} />}
        {state.phase === "quiz" && (
          <Quiz
            index={state.index}
            answers={state.answers}
            onAnswer={(optionId) => dispatch({ type: "answer", optionId })}
            onBack={() => dispatch({ type: "back" })}
          />
        )}
        {state.phase === "result" && (
          <Result
            answers={state.answers}
            onBack={() => dispatch({ type: "back" })}
            onRestart={() => {
              // Pristine state isn't persisted, so clear the store explicitly
              // — otherwise a reload would restore the old result.
              try {
                sessionStorage.removeItem(STORAGE_KEY);
              } catch {
                /* non-fatal */
              }
              dispatch({ type: "restart" });
            }}
          />
        )}
      </main>
    </div>
  );
}

// =============================================================================
// Intro
// =============================================================================

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="ec-card ec-intro" aria-labelledby="ec-intro-heading">
      <p className="ec-eyebrow">Engpass-Check</p>
      <h1 id="ec-intro-heading" className="ec-display">
        {INTRO.heading}
      </h1>
      <p className="ec-lead">{INTRO.lead}</p>
      <button type="button" className="ec-btn ec-btn-primary" onClick={onStart}>
        {INTRO.startLabel}
      </button>
      <p className="ec-meta">{INTRO.meta}</p>
    </section>
  );
}

// =============================================================================
// Quiz — one question at a time
// =============================================================================

function Quiz({
  index,
  answers,
  onAnswer,
  onBack,
}: {
  index: number;
  answers: Answers;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
}) {
  const question = QUESTIONS[index];
  const selected = answers[question.id];
  const progress = Math.round(((index + 1) / TOTAL_QUESTIONS) * 100);

  return (
    <section className="ec-card ec-quiz" aria-labelledby="ec-question">
      <div className="ec-progress">
        <div className="ec-progress-bar">
          <span className="ec-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="ec-progress-label">
          Frage {index + 1} <span aria-hidden="true">/</span> {TOTAL_QUESTIONS}
        </p>
      </div>

      <h2 id="ec-question" className="ec-question">
        {question.prompt}
      </h2>

      <div className="ec-options" role="radiogroup" aria-labelledby="ec-question">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`ec-option${isSelected ? " is-selected" : ""}`}
              onClick={() => onAnswer(option.id)}
            >
              <span className="ec-option-dot" aria-hidden="true" />
              <span className="ec-option-label">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="ec-quiz-nav">
        <button type="button" className="ec-btn ec-btn-ghost" onClick={onBack}>
          ← Zurück
        </button>
        <p className="ec-quiz-hint">Tippe eine Antwort an — es geht sofort weiter.</p>
      </div>
    </section>
  );
}

// =============================================================================
// Result — der vollständige Report (Render-Reihenfolge 1–10 aus 06-quiz-spec.md)
// =============================================================================

function Result({
  answers,
  onBack,
  onRestart,
}: {
  answers: Answers;
  onBack: () => void;
  onRestart: () => void;
}) {
  const model = useMemo(() => buildReportModel(answers, computeResult(answers)), [answers]);

  return (
    <section className="ec-result" aria-label={RESULT.heading}>
      {/* Punkte 1–8: gratis und vollständig sichtbar (9-1-1-Regel) */}
      <div className="ec-card ec-report-card">
        <p className="ec-eyebrow">{RESULT.heading}</p>
        <Report model={model} />

        <div className="ec-result-nav">
          <button type="button" className="ec-btn ec-btn-ghost" onClick={onBack}>
            ← Antworten ändern
          </button>
          <button type="button" className="ec-btn ec-btn-ghost" onClick={onRestart}>
            Neu starten
          </button>
        </div>
      </div>

      {/* Punkt 9: Opt-in */}
      <OptIn answers={answers} />

      {/* Punkt 10: Video-Verweis */}
      <VideoVerweis />
    </section>
  );
}

// =============================================================================
// Video-Verweis (Punkt 10)
// =============================================================================

function VideoVerweis() {
  return (
    <div className="ec-card ec-video">
      <p className="ec-report-text">{VIDEO_INTRO}</p>
      {VIDEO_URL ? (
        <a className="ec-video-link" href={VIDEO_URL} target="_blank" rel="noopener noreferrer">
          → {VIDEO_TITLE} <span className="ec-video-label">({VIDEO_LABEL})</span>
        </a>
      ) : (
        <p className="ec-video-link" aria-disabled="true">
          → {VIDEO_TITLE} <span className="ec-video-label">({VIDEO_LABEL})</span>
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Opt-in form → CleverReach (via /api/engpass-check)
// =============================================================================

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function OptIn({ answers }: { answers: Answers }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    const tid = captureTrackingId();
    try {
      const response = await fetch("/api/engpass-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), answers, ...(tid ? { tid } : {}) }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (!response.ok || !data?.ok) throw new Error("submit failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="ec-card ec-optin ec-optin-success" role="status">
        <h2 className="ec-optin-heading">{OPTIN.successHeading}</h2>
        <p className="ec-block-text">{OPTIN.successBody}</p>
      </div>
    );
  }

  return (
    <div className="ec-card ec-optin">
      <h2 className="ec-optin-heading">{OPTIN.heading}</h2>
      <p className="ec-report-text">{OPTIN_TEXT}</p>

      <form className="ec-form" onSubmit={handleSubmit} noValidate>
        <label className="ec-field-label" htmlFor="ec-email">
          {OPTIN.emailLabel}
        </label>
        <div className="ec-field-row">
          <input
            id="ec-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={OPTIN.emailPlaceholder}
            className="ec-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "submitting"}
            aria-invalid={status === "error"}
          />
          <button
            type="submit"
            className="ec-btn ec-btn-primary"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Wird gesendet …" : OPTIN.submitLabel}
          </button>
        </div>

        {status === "error" && (
          <p className="ec-form-error" role="alert">
            {OPTIN.errorBody}
          </p>
        )}

        <p className="ec-consent">
          {OPTIN.consent}{" "}
          <a className="ec-consent-link" href={OPTIN.datenschutzHref}>
            {OPTIN.datenschutzLabel}
          </a>
        </p>
        <p className="ec-datenschutz">{DATENSCHUTZ_HINWEIS}</p>
      </form>
    </div>
  );
}
