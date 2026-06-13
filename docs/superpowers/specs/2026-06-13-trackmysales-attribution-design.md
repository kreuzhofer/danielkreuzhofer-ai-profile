# Design: trackmysales-Attribution für den Engpass-Check-Funnel (Option A)

**Datum:** 2026-06-13
**Status:** Entwurf – wartet auf Abnahme
**Repos:** `danielkreuzhofer-ai-profile` (Funnel) + `track-my-sales` (Attribution-Service)

## Problem / Kontext

Wir verlinken den Lead-Magnet (`/engpass-check`) per trackmysales-Shortlink aus
Videos. trackmysales setzt beim Klick eine Visitor-ID (`tid`) und misst, von
welchem Video wie viele Klicks kommen.

Bisher (CleverReach-Welt) wurde die **Conversion** (Lead bestätigt) attribuiert,
indem CleverReach nach dem Double-Opt-in auf einen trackmysales-Attribution-Link
(`/c/:code`) umleitete, der das `tid`-Cookie las, die Conversion auf das Video
buchte und zur finalen Seite weiterleitete.

Der eigene Funnel macht diesen Redirect **nicht mehr** → die Lead→Video-Attribution
geht verloren. Diese Lücke schließt dieses Design.

## Schlüssel-Erkenntnis

trackmysales liest sein Cookie **nicht** cross-domain. Beim Redirect hängt es die
Visitor-ID als `?tid=...` an die Ziel-URL an (`track-my-sales/src/controllers/redirect.ts:188-192`).
Der Lead landet also auf `…/engpass-check?tid=XXXX`.

→ Wir fangen das `tid` beim Landen ab, tragen es durch unseren Funnel, speichern es
an der Submission und **melden die Conversion bei DOI-Bestätigung selbst, server-to-server.**
Das ist robuster als der Cookie-Weg: es überlebt Third-Party-Cookie-Blocking und
funktioniert geräteübergreifend (Video am Handy, Bestätigung am Desktop), weil das
`tid` serverseitig an der Submission hängt – unabhängig vom Cookie.

## Architektur & Datenfluss

```
Video → trackmysales-Shortlink (setzt tid) → /engpass-check?tid=XXXX
   • Quiz-UI fängt ?tid ab, hält es in sessionStorage (überlebt Quiz + Reload)
   • Opt-in: POST /api/engpass-check { email, answers, tid }
       → Submission-Row speichert tid (nullable)
   • DOI-Mail → /engpass-check/bestaetigen?token=…  → confirmByToken()
       • confirm wie bisher (E-Mail, CleverReach-Push)
       • NEU, best-effort, nur wenn tid vorhanden + konfiguriert:
         POST {TRACKMYSALES}/api/webhook/conversion/lead
              Header: X-Conversion-Secret: <shared secret>
              Body:   { code: "<conversionLinkCode>", trackingId: tid }
   → trackmysales bucht email_list-Conversion (Final-Touch) auf das Video
```

## Änderungen — `track-my-sales` (neuer Server-Endpoint)

**Neu: `POST /api/webhook/conversion/lead`** — server-to-server-Variante von
`recordConversion` (`src/controllers/conversionRedirect.ts:17-154`). Identische
Attributionslogik, nur die Quelle der Identität + der Zugriffsschutz unterscheiden sich:

- **Body:** `{ code: string, trackingId: string }` (kein Cookie, keine Origin).
- **Auth:** Shared-Secret-Header `X-Conversion-Secret` gegen `LEAD_CONVERSION_SECRET`
  (env). Fehlt/falsch → 401. (Ersetzt den Origin-Domain-Check des Browser-Beacons.)
- **Logik wiederverwenden (1:1 wie `recordConversion`):**
  ConversionLink per `code` (aktiv?) → User per `trackingId` → tenant-scoped
  Final-Touch (jüngster Klick auf `link.accountId`) → **email_list-Dedup**
  (findFirst + P2002-Backstop) → `conversionTimeDays` → `ConversionEvent.create`
  mit `conversionType` des Links, `revenue=null` für email_list.
- **Response:** `200 { attributed: boolean, conversionId?: string, reason?: string }`
  (im Gegensatz zum stillen 204-Beacon, damit unser Backend das Ergebnis loggen kann).
  Attributionsfehler (unbekannte tid, kein In-Account-Klick, Dedup) sind **kein**
  Fehler → 200 mit `attributed:false` + `reason`.
- Refactor: gemeinsame Kernlogik aus `recordConversion` in eine Funktion ziehen
  (`attributeLeadConversion({ code, trackingId })`), die beide Endpoints nutzen,
  damit es nur eine Wahrheit gibt.
- Route registrieren in `src/routes/webhook.ts`; `LEAD_CONVERSION_SECRET` in
  `src/config` + `example.env`.

## Änderungen — `danielkreuzhofer-ai-profile` (Funnel)

1. **tid abfangen (Client):** In `EngpassCheck.tsx` beim Mount `?tid` aus der URL
   lesen, in sessionStorage ablegen (überlebt Quiz-Schritte + Reload). Kein tid →
   kein Tracking, alles läuft normal weiter.
2. **tid mitschicken:** Opt-in-`POST /api/engpass-check`-Body um `tid?: string`
   erweitern; serverseitig validieren (kurzer Token, Längen-/Zeichen-Limit) und an
   `insertSubmission` durchreichen.
3. **Persistenz:** Neue nullable Spalte `submissions.tid` (text) + Drizzle-Migration.
4. **Conversion melden (Server):** In `confirm.ts` nach erfolgreicher Bestätigung,
   best-effort + non-fatal (genau wie der CleverReach-Push), nur wenn `submission.tid`
   gesetzt und trackmysales konfiguriert: `reportLeadConversion(tid)` →
   `POST {TRACKMYSALES_BASE_URL}/api/webhook/conversion/lead`. Idempotenz ist doppelt
   abgesichert (unser confirm ist idempotent **und** trackmysales dedupt email_list).
   Neues Modul `src/lib/engpass-check/trackmysales.ts` (analog `cleverreach.ts`):
   `isTrackmysalesConfigured()`, `reportLeadConversion(tid)`.
5. **Config/env:** `TRACKMYSALES_BASE_URL`, `TRACKMYSALES_CONVERSION_CODE`
   (der email_list-ConversionLink-Code), `TRACKMYSALES_CONVERSION_SECRET`
   (= `LEAD_CONVERSION_SECRET` der anderen Seite). In `.env.example` dokumentieren.

## Ops-Schritt (Daniel, einmalig)

In trackmysales eine **email_list-ConversionLink** anlegen (z.B. Code `engpass-check`),
`targetUrl` beliebig (wird in diesem Server-Flow nie durchlaufen). Diesen Code als
`TRACKMYSALES_CONVERSION_CODE` setzen. Das Shared Secret auf beiden Seiten setzen.

## Entscheidungen (in der Spec-Review zu bestätigen)

- **D1 — ConversionLink wiederverwenden:** Wir nutzen das vorhandene
  email_list-ConversionLink-Modell (Account-Scoping, Dedup, Typ) statt eines neuen
  Modells. Endpoint nimmt `{ code, trackingId }`. *(empfohlen)*
- **D2 — Auth = Shared Secret** (`X-Conversion-Secret`), server-to-server. *(empfohlen;
  Alternative: öffentlich wie die anderen Webhooks — abgelehnt, weil spoofbare
  Conversions)*
- **D3 — Conversion-Zeitpunkt = DOI-Bestätigung** (nicht Submit), passend zu
  „E-Mail eingetragen **und** bestätigt". *(empfohlen)*
- **D4 — tid-Speicherung:** nullable `submissions.tid`; Capture per `?tid`,
  Persistenz via sessionStorage durch den Quiz. *(empfohlen)*

## Tests / Verifikation

- **trackmysales:** Unit/Supertest für `/api/webhook/conversion/lead`:
  falsches/fehlendes Secret → 401; unbekannte tid → 200 `attributed:false`; gültig →
  ConversionEvent angelegt; zweiter Call → Dedup `attributed:false`. Kernlogik-Refactor
  darf bestehende `/c/:code`-Tests nicht brechen.
- **Funnel:** tid-Capture (mit/ohne `?tid`, Reload-Persistenz); Route reicht tid an
  Submission durch; `confirm.ts` ruft `reportLeadConversion` nur bei vorhandenem tid +
  Konfiguration, Fehler ist non-fatal (Lead bekommt trotzdem Report); trackmysales-Client
  gemockt. Bestehende 65 Engpass-Tests bleiben grün.
- **End-to-end (manuell):** echten Shortlink klicken → `?tid` landet → Quiz → DOI →
  in trackmysales prüfen, dass die email_list-Conversion auf den Klick/das Video gebucht ist.

## Out of Scope

- Revenue/Sale-Attribution (das ist ein Lead, kein Kauf — `revenue=null`).
- Klick-Tracking selbst (bleibt unverändert in trackmysales).
- Migration alter/bestehender Leads.
