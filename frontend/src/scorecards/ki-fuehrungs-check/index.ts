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
  doiSubject: "Ein Klick noch, dann kommt Dein KI-Führungs-Report",
  deliverySubject: "Dein KI-Führungs-Report ist da",
  cleverreachSource: "ki-fuehrungs-check",
};
