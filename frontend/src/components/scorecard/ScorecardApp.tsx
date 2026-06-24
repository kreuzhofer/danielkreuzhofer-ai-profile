"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { buildResult } from "@/lib/scorecard/result";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import { brandStyle } from "@/lib/scorecard/branding";
import { ScorecardReportView, DEFAULT_REPORT_LABELS } from "./ScorecardReportView";
import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import type { ScorecardContent } from "@/lib/scorecard/content";
import type { Answers, Question } from "@/lib/scorecard/types";

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
  | { type: "answer"; questionId: string; optionId: string }
  | { type: "back" }
  | { type: "restart" }
  | { type: "hydrate"; state: State };

const INITIAL_STATE: State = { phase: "intro", index: 0, answers: {} };

/** The reducer depends on the question count, which is per-scorecard. */
function makeReducer(total: number) {
  return function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "start":
        return { ...state, phase: "quiz", index: 0 };
      case "answer": {
        const answers = { ...state.answers, [action.questionId]: action.optionId };
        const isLast = state.index >= total - 1;
        return isLast
          ? { phase: "result", index: state.index, answers }
          : { phase: "quiz", index: state.index + 1, answers };
      }
      case "back":
        if (state.phase === "result") return { ...state, phase: "quiz", index: total - 1 };
        if (state.index > 0) return { ...state, index: state.index - 1 };
        return { ...state, phase: "intro" };
      case "restart":
        return INITIAL_STATE;
      case "hydrate":
        return action.state;
      default:
        return state;
    }
  };
}

/** Capture the trackmysales ?tid on landing into sessionStorage (slug-scoped). */
function captureTid(slug: string): string | null {
  if (typeof window === "undefined") return null;
  const key = `scorecard:${slug}:tid`;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("tid");
    if (fromUrl) sessionStorage.setItem(key, fromUrl);
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

// =============================================================================
// Component
// =============================================================================

export function ScorecardApp({ registration }: { registration: ScorecardRegistration }) {
  const { definition, content, branding } = registration;
  const slug = definition.slug;
  const questions = definition.questions;
  const total = questions.length;
  const storageKey = `scorecard:${slug}:state`;

  const reducer = useMemo(() => makeReducer(total), [total]);
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Capture ?tid on landing (side-effect only).
  useEffect(() => {
    captureTid(slug);
  }, [slug]);

  // Restore in-progress answers after mount (client-only). sessionStorage keeps
  // answers in the browser only — nothing leaves the device before the opt-in.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as State;
        if (parsed && typeof parsed.index === "number" && parsed.answers) {
          dispatch({ type: "hydrate", state: parsed });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [storageKey]);

  useEffect(() => {
    // Never persist the pristine intro state (keeps restore robust under
    // StrictMode's double-invoked effects).
    if (state.phase === "intro" && Object.keys(state.answers).length === 0) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [state, storageKey]);

  return (
    <div className="sc-shell" style={brandStyle(branding)}>
      <div className="sc-page">
        <header className="sc-topbar">
          <Link href="/" className="sc-brand" aria-label={`Zur Startseite von ${branding.brandAuthor}`}>
            <span className="sc-brand-name">{branding.brandName}</span>
            <span className="sc-brand-author">{branding.brandAuthor}</span>
          </Link>
        </header>

        <main className="sc-main">
        {state.phase === "intro" && (
          <Intro content={content} onStart={() => dispatch({ type: "start" })} />
        )}
        {state.phase === "quiz" && (
          <Quiz
            question={questions[state.index]}
            index={state.index}
            total={total}
            answers={state.answers}
            onAnswer={(optionId) =>
              dispatch({ type: "answer", questionId: questions[state.index].id, optionId })
            }
            onBack={() => dispatch({ type: "back" })}
          />
        )}
        {state.phase === "result" && (
          <Result
            registration={registration}
            answers={state.answers}
            onBack={() => dispatch({ type: "back" })}
            onRestart={() => {
              try {
                sessionStorage.removeItem(storageKey);
              } catch {
                /* non-fatal */
              }
              dispatch({ type: "restart" });
            }}
          />
        )}
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// Intro
// =============================================================================

function Intro({ content, onStart }: { content: ScorecardContent; onStart: () => void }) {
  return (
    <section className="sc-card sc-intro" aria-labelledby="sc-intro-heading">
      {content.intro.eyebrow && <p className="sc-eyebrow">{content.intro.eyebrow}</p>}
      <h1 id="sc-intro-heading" className="sc-display">
        {content.intro.heading}
      </h1>
      <p className="sc-lead">{content.intro.lead}</p>
      <button type="button" className="sc-btn sc-btn-primary" onClick={onStart}>
        {content.intro.startLabel}
      </button>
      <p className="sc-meta">{content.intro.meta}</p>
    </section>
  );
}

// =============================================================================
// Quiz — one question at a time
// =============================================================================

function Quiz({
  question,
  index,
  total,
  answers,
  onAnswer,
  onBack,
}: {
  question: Question;
  index: number;
  total: number;
  answers: Answers;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
}) {
  const selected = answers[question.id];
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <section className="sc-card sc-quiz" aria-labelledby="sc-question">
      <div className="sc-progress">
        <div className="sc-progress-bar">
          <span className="sc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="sc-progress-label">
          Frage {index + 1} <span aria-hidden="true">/</span> {total}
        </p>
      </div>

      <h2 id="sc-question" className="sc-question">
        {question.prompt}
      </h2>

      <div className="sc-options" role="radiogroup" aria-labelledby="sc-question">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`sc-option${isSelected ? " is-selected" : ""}`}
              onClick={() => onAnswer(option.id)}
            >
              <span className="sc-option-dot" aria-hidden="true" />
              <span className="sc-option-label">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sc-quiz-nav">
        <button type="button" className="sc-btn sc-btn-ghost" onClick={onBack}>
          ← Zurück
        </button>
        <p className="sc-quiz-hint">Tippe eine Antwort an — es geht sofort weiter.</p>
      </div>
    </section>
  );
}

// =============================================================================
// Result — full free report + opt-in + video
// =============================================================================

function Result({
  registration,
  answers,
  onBack,
  onRestart,
}: {
  registration: ScorecardRegistration;
  answers: Answers;
  onBack: () => void;
  onRestart: () => void;
}) {
  const { definition, content } = registration;
  const model = useMemo(
    () => buildScorecardReport(registration, buildResult(definition, answers), answers),
    [registration, definition, answers],
  );

  return (
    <section className="sc-result" aria-label={content.resultHeading}>
      <div className="sc-card sc-report-card">
        <p className="sc-eyebrow">{content.resultHeading}</p>
        <ScorecardReportView model={model} labels={DEFAULT_REPORT_LABELS} />

        <div className="sc-result-nav">
          <button type="button" className="sc-btn sc-btn-ghost" onClick={onBack}>
            ← Antworten ändern
          </button>
          <button type="button" className="sc-btn sc-btn-ghost" onClick={onRestart}>
            Neu starten
          </button>
        </div>
      </div>

      <OptIn slug={definition.slug} answers={answers} content={content} />

      {content.video && <VideoVerweis video={content.video} />}
    </section>
  );
}

function VideoVerweis({ video }: { video: NonNullable<ScorecardContent["video"]> }) {
  return (
    <div className="sc-card sc-video">
      <p className="sc-report-text">{video.intro}</p>
      {video.url ? (
        <a className="sc-video-link" href={video.url} target="_blank" rel="noopener noreferrer">
          → {video.title} <span className="sc-video-label">({video.label})</span>
        </a>
      ) : (
        <p className="sc-video-link" aria-disabled="true">
          → {video.title} <span className="sc-video-label">({video.label})</span>
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Opt-in → POST /api/scorecard/[slug]/submit
// =============================================================================

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function OptIn({
  slug,
  answers,
  content,
}: {
  slug: string;
  answers: Answers;
  content: ScorecardContent;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const c = content.optin;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    const tid = captureTid(slug);
    try {
      const response = await fetch(`/api/scorecard/${slug}/submit`, {
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
      <div className="sc-card sc-optin sc-optin-success" role="status">
        <h2 className="sc-optin-heading">{c.successHeading}</h2>
        <p className="sc-report-text">{c.successBody}</p>
      </div>
    );
  }

  return (
    <div className="sc-card sc-optin">
      <h2 className="sc-optin-heading">{c.heading}</h2>
      <p className="sc-report-text">{c.body}</p>

      <form className="sc-form" onSubmit={handleSubmit} noValidate>
        <label className="sc-field-label" htmlFor="sc-email">
          {c.emailLabel}
        </label>
        <div className="sc-field-row">
          <input
            id="sc-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={c.emailPlaceholder}
            className="sc-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "submitting"}
            aria-invalid={status === "error"}
          />
          <button type="submit" className="sc-btn sc-btn-primary" disabled={status === "submitting"}>
            {status === "submitting" ? "Wird gesendet …" : c.button}
          </button>
        </div>

        {status === "error" && (
          <p className="sc-form-error" role="alert">
            {c.errorBody}
          </p>
        )}

        <p className="sc-consent">
          {c.consent}{" "}
          <a className="sc-consent-link" href={c.datenschutzHref}>
            Mehr in der Datenschutzerklärung
          </a>
        </p>
        {c.datenschutzHinweis && <p className="sc-datenschutz">{c.datenschutzHinweis}</p>}
      </form>
    </div>
  );
}
