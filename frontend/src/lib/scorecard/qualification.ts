/**
 * Generic qualification — AND over the required questions' `qualifies` flag.
 */

import type { Answers, ScorecardDefinition } from "./types";

export function isQualified(def: ScorecardDefinition, answers: Answers): boolean {
  return def.qualification.requireQualifies.every((qid) => {
    const q = def.questions.find((x) => x.id === qid);
    const opt = q?.options.find((o) => o.id === answers[qid]);
    return opt?.qualifies === true;
  });
}
