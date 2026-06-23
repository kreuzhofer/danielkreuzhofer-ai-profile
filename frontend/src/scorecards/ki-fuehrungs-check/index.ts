import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import { definition } from "./definition";
import { content } from "./content";
import { branding } from "./branding";

export const kiFuehrungsCheck: ScorecardRegistration = {
  definition,
  content,
  branding,
  meta: {
    title: "KI-Führungs-Check — führst Du KI oder kaufst Du sie nur ein?",
    description:
      "7 Fragen, 3 Minuten: Finde heraus, ob Du KI in Deinem Bereich wirklich führst, welcher " +
      "Führungs-Typ auf Dich zutrifft und was Dein nächster Schritt ist.",
  },
  doiSubject: "Ein Klick noch, dann hast Du Dein KI-Führungs-Toolkit",
  deliverySubject: "Dein KI-Führungs-Check ist da, plus Dein Umsetzungs-Toolkit",
  cleverreachSource: "ki-fuehrungs-check",
};
