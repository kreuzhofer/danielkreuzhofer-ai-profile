/**
 * Generic qualification — AND over the required questions' `qualifies` flag.
 */

import type { Answers, ScorecardDefinition } from "./types";

export function isQualified(def: ScorecardDefinition, answers: Answers): boolean {
  return def.qualification.requireQualifies.every((qid) => {
    const q = def.questions.find((x) => x.id === qid);
    const v = answers[qid];
    if (typeof v !== "string") return false; // multi-select values never qualify
    const opt = q?.options.find((o) => o.id === v);
    return opt?.qualifies === true;
  });
}
